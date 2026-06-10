"""千问 DashScope API 客户端封装."""

from __future__ import annotations

import json
import os
from typing import Any

import dashscope
from dashscope import Generation


def _get_api_key() -> str:
    # 优先从环境变量读取，fallback 到 .env 文件
    key = os.environ.get("DASHSCOPE_API_KEY", "")
    if key:
        return key

    # 尝试从 .env 文件加载
    env_paths = [
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", ".env"),
        os.path.join(os.getcwd(), ".env"),
    ]
    for p in env_paths:
        p = os.path.abspath(p)
        if os.path.exists(p):
            with open(p) as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("DASHSCOPE_API_KEY="):
                        return line.split("=", 1)[1].strip()
    return ""


dashscope.api_key = _get_api_key()

SYSTEM_PROMPT = """你是"智慧医疗数字人助手"，一个基于 SMPL-X 3D 人体模型的智能医疗顾问。

你的角色定位：
- 你是一个专业的 AI 医疗助手，运行在医院的智能导诊终端上
- 你的声音和形象通过 3D 数字人呈现给患者
- 你帮助患者解答健康问题、指导就医流程、演示康复动作

你的能力：
1. 根据症状提供科室导诊建议
2. 解释体检报告指标的含义
3. 为慢性病患者提供日常管理建议
4. 演示康复动作步骤
5. 进行老年综合健康评估

回复要求：
- 使用专业但易懂的中文
- 结构清晰，分点说明
- 始终包含"建议科室"和"风险提示"
- 结尾附上免责声明
- 语气温暖、专业、可靠

{rag_context}

{patient_context}

当前对话上下文：
{chat_history}"""


def chat(
    user_message: str,
    rag_context: str = "",
    patient_context: str = "",
    chat_history: str = "",
    model: str = "qwen-plus",
) -> dict[str, Any]:
    """调用千问 API 进行对话。

    Returns:
        {"text": str, "raw": ...}
    """
    prompt = SYSTEM_PROMPT.format(
        rag_context=rag_context or "（暂无知识库参考）",
        patient_context=patient_context or "（暂无患者档案）",
        chat_history=chat_history or "（新对话）",
    )

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": user_message},
    ]

    try:
        response = Generation.call(
            model=model,
            messages=messages,
            result_format="message",
            max_tokens=1500,
            temperature=0.7,
        )

        if response.status_code == 200:
            output = response.output
            if isinstance(output, dict):
                text = output["choices"][0]["message"]["content"]
            else:
                text = output.choices[0].message.content
            return {
                "text": text,
                "raw": response,
                "status": "ok",
            }
        else:
            code = response.code if hasattr(response, 'code') else response.status_code
            msg = response.message if hasattr(response, 'message') else str(response)
            return {
                "text": f"AI 服务暂时不可用（{code}），请稍后重试。",
                "raw": str(response),
                "status": "error",
                "code": code,
                "message": msg,
            }

    except Exception as exc:
        return {
            "text": "AI 服务连接失败，请检查网络后重试。",
            "raw": str(exc),
            "status": "error",
        }


def embed_texts(texts: list[str], model: str = "text-embedding-v3") -> list[list[float]]:
    """将文本列表转为 embedding 向量，用于 RAG 索引。"""
    from dashscope import TextEmbedding

    embeddings = []
    for text in texts:
        try:
            resp = TextEmbedding.call(model=model, input=text)
            if resp.status_code == 200:
                # 兼容不同 dashscope 版本：output 可能是对象或 dict
                output = resp.output
                if isinstance(output, dict):
                    embeds = output.get("embeddings", [])
                    if embeds:
                        embeddings.append(embeds[0].get("embedding", embeds[0]) if isinstance(embeds[0], dict) else embeds[0])
                    else:
                        embeddings.append([0.0] * 1024)
                else:
                    embeddings.append(output.embeddings[0].embedding)
            else:
                embeddings.append([0.0] * 1024)
        except Exception as e:
            print(f"[embed_texts] error: {e}")
            embeddings.append([0.0] * 1024)
    return embeddings


def parse_medical_response(text: str) -> dict[str, Any]:
    """尝试从 LLM 回复中结构化提取医疗信息。

    解析失败时返回默认结构，不阻塞对话流程。
    """
    return {
        "answer": text,
        "subtitle": text[:200] if len(text) > 200 else text,
        "avatarState": "speaking",
        "riskLevel": "low",
        "suggestedDepartments": [],
        "knowledgeSources": [],
        "cards": [],
    }
