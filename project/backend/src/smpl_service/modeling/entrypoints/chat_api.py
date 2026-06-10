"""AI 对话 API — FastAPI 服务 (Port 8001).

启动:
  cd project/backend && PYTHONPATH=src uvicorn smpl_service.modeling.entrypoints.chat_api:app --host 0.0.0.0 --port 8001

环境变量:
  DASHSCOPE_API_KEY  千问 API Key（优先读取，否则从 .env 文件读取）
"""

from __future__ import annotations

from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .llm_client import chat, parse_medical_response
from .rag_service import search, format_rag_context
from .chat_session import create_session, get_session, add_message, get_chat_history, set_patient
from .patient_store import get_patient, save_patient, format_patient_context, MOCK_PATIENT

app = FastAPI(title="智慧医疗数字人 AI 对话服务", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ──

class ChatRequest(BaseModel):
    message: str
    mode: str = "text"  # "text" | "voice"
    session_id: Optional[str] = None
    patient_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    subtitle: str
    avatarState: str = "speaking"
    gesture: str = "explain"
    riskLevel: str = "low"
    suggestedDepartments: list[str] = Field(default_factory=list)
    knowledgeSources: list[str] = Field(default_factory=list)
    cards: list[dict] = Field(default_factory=list)
    session_id: str = ""


class PatientUploadRequest(BaseModel):
    name: str
    gender: str = "男"
    age: int = 0
    height_cm: float = 0
    weight_kg: float = 0
    medical_history: list[dict] = Field(default_factory=list)
    medications: list[dict] = Field(default_factory=list)
    symptoms: list[str] = Field(default_factory=list)


# ── Endpoints ──

@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    """文字/语音对话入口。"""
    # 会话管理
    sid = req.session_id or create_session()
    session = get_session(sid)
    if not session:
        sid = create_session()

    # 患者档案
    patient = None
    pid = req.patient_id or (session.get("patient_id") if session else None)
    if pid:
        patient = get_patient(pid)
    patient_ctx = format_patient_context(patient)

    # RAG 检索
    rag_results = search(req.message, top_k=5)
    rag_ctx = format_rag_context(rag_results)

    # 对话历史
    history = get_chat_history(sid)

    # 调用 LLM
    result = chat(
        user_message=req.message,
        rag_context=rag_ctx,
        patient_context=patient_ctx,
        chat_history=history,
    )

    # 记录对话
    add_message(sid, "user", req.message)
    add_message(sid, "assistant", result["text"])

    # 结构化解析
    parsed = parse_medical_response(result["text"])

    # 提取知识来源
    sources = list({r["collection"] for r in rag_results}) if rag_results else ["AI医疗助手知识库"]

    # 尝试从回答中提取科室建议
    departments = _extract_departments(result["text"])

    # 风险评估
    risk = _assess_risk(result["text"], patient)

    return ChatResponse(
        answer=result["text"],
        subtitle=parsed.get("subtitle", result["text"][:200]),
        avatarState=parsed.get("avatarState", "speaking"),
        gesture=parsed.get("gesture", "explain"),
        riskLevel=risk,
        suggestedDepartments=departments,
        knowledgeSources=sources,
        cards=[
            {"title": "建议科室", "content": " / ".join(departments) if departments else "请根据症状选择对应科室"},
            {"title": "知识来源", "content": " / ".join(sources)},
        ],
        session_id=sid,
    )


@app.get("/api/chat/history/{session_id}")
def get_history(session_id: str):
    """获取对话历史。"""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    return {"session_id": session_id, "messages": session.get("messages", [])}


@app.post("/api/patient/upload")
def upload_patient(req: PatientUploadRequest):
    """上传/创建患者档案。"""
    data = {
        "name": req.name,
        "gender": req.gender,
        "age": req.age,
        "height_cm": req.height_cm,
        "weight_kg": req.weight_kg,
        "bmi": round(req.weight_kg / ((req.height_cm / 100) ** 2), 1) if req.height_cm > 0 else 0,
        "medical_history": req.medical_history,
        "medications": req.medications,
        "recent_symptoms": req.symptoms,
    }
    pid = save_patient(data)
    return {"patient_id": pid, "message": "患者档案已保存"}


@app.get("/api/patient/{patient_id}")
def query_patient(patient_id: str):
    """查询患者档案。"""
    patient = get_patient(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="患者不存在")
    return patient


@app.get("/api/patient/mock/zhang-75")
def get_mock_patient():
    """获取模拟患者（张建国，75岁男性）。"""
    return MOCK_PATIENT


@app.get("/api/health")
def health():
    """健康检查。"""
    return {
        "status": "ok",
        "service": "AI Chat API",
        "llm_api_configured": bool(__import__("os").environ.get("DASHSCOPE_API_KEY") or
                                   __import__("os").path.exists(
                                       __import__("os").path.join(
                                           __import__("os").path.dirname(__file__), "..", "..", "..", "..", ".env"
                                       )
                                   )),
    }


# ── Helpers ──

def _extract_departments(text: str) -> list[str]:
    """从回答中简单提取科室名称。"""
    dept_keywords = [
        "全科", "内科", "神经内科", "心内科", "内分泌科", "消化内科", "呼吸内科",
        "外科", "骨科", "康复科", "老年科", "耳鼻喉科", "眼科", "皮肤科",
        "妇科", "儿科", "精神科", "心理科", "营养科", "体检中心", "急诊科",
    ]
    found = []
    for d in dept_keywords:
        if d in text and d not in found:
            found.append(d)
    return found[:5] if found else ["全科"]


def _assess_risk(text: str, patient: dict | None) -> str:
    """简单风险评估。"""
    high_keywords = ["立即", "紧急", "拨打120", "急诊", "严重", "危险", "剧烈", "意识障碍", "瘫痪"]
    medium_keywords = ["建议就诊", "尽快", "警惕", "风险", "注意", "不建议", "不要自行"]

    for kw in high_keywords:
        if kw in text:
            return "high"
    for kw in medium_keywords:
        if kw in text:
            return "medium"
    return "low"
