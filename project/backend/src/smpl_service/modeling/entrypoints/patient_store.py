"""患者档案管理 — 内存存储 + JSON 文件持久化."""

from __future__ import annotations

import json
import os
import time
import uuid
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).resolve().parents[3] / "patient_data"
os.makedirs(str(DATA_DIR), exist_ok=True)

# 内存缓存
_cache: dict[str, dict[str, Any]] = {}

# 模拟患者：75 岁老人张建国
MOCK_PATIENT: dict[str, Any] = {
    "id": "patient-zhang-75",
    "name": "张建国",
    "gender": "男",
    "age": 75,
    "height_cm": 168,
    "weight_kg": 72,
    "bmi": 25.5,
    "medical_history": [
        {"disease": "原发性高血压（2级）", "since": "2015年", "status": "药物控制中，近期波动"},
        {"disease": "2型糖尿病", "since": "2019年", "status": "口服药控制，HbA1c 7.2%"},
        {"disease": "双膝骨关节炎", "since": "2020年", "status": "间歇性疼痛，VAS 4-5分"},
        {"disease": "前列腺增生", "since": "2022年", "status": "夜尿2-3次"},
        {"disease": "轻度认知障碍", "since": "2023年", "status": "MMSE 26/30"},
        {"disease": "失眠症", "since": "2023年", "status": "入睡困难，4-5小时/晚"},
    ],
    "medications": [
        {"drug": "苯磺酸氨氯地平", "dose": "5mg", "frequency": "qd 早晨", "purpose": "降压"},
        {"drug": "厄贝沙坦", "dose": "150mg", "frequency": "qd 早晨", "purpose": "降压"},
        {"drug": "盐酸二甲双胍", "dose": "500mg", "frequency": "bid 早晚餐后", "purpose": "降糖"},
        {"drug": "阿卡波糖", "dose": "50mg", "frequency": "tid 餐时", "purpose": "降糖"},
        {"drug": "非那雄胺", "dose": "5mg", "frequency": "qd 睡前", "purpose": "前列腺"},
        {"drug": "盐酸氨基葡萄糖", "dose": "750mg", "frequency": "bid", "purpose": "关节"},
        {"drug": "艾司唑仑", "dose": "1mg", "frequency": "qn 睡前(按需)", "purpose": "助眠"},
    ],
    "recent_exam": {
        "date": "2026-05-15",
        "blood_pressure": "148/92 mmHg",
        "heart_rate": 78,
        "fasting_glucose": 7.8,
        "hba1c": 7.2,
        "total_cholesterol": 5.42,
        "triglycerides": 2.15,
        "ldl": 3.28,
        "hdl": 1.02,
        "creatinine": 98,
        "egfr": 72,
        "uric_acid": 468,
        "hemoglobin": 128,
        "ecg": "窦性心律，偶发室性早搏，左室高电压",
        "carotid_us": "双侧颈动脉斑块形成（<50%狭窄）",
        "bone_density_t": -2.1,
        "mmse": 26,
        "tinetti": 22,
    },
    "recent_symptoms": [
        "早晨起床头晕（近2周发作3次，持续10-15分钟）",
        "活动耐力下降（散步15分钟即感疲劳）",
        "右膝疼痛加重（VAS 4-5分）",
        "记忆力下降（常忘记服药）",
        "睡眠差（4-5小时/晚）",
        "食欲减退（饭量减少1/3，体重下降1.5kg/月）",
    ],
    "family": "与72岁配偶同住，住3楼无电梯，女儿每周探望2-3次",
    "allergies": ["青霉素（轻微皮疹）"],
}


def get_patient(patient_id: str) -> dict[str, Any] | None:
    """获取患者档案。"""
    # 先查缓存
    if patient_id in _cache:
        return _cache[patient_id]

    # 查文件
    file_path = DATA_DIR / f"{patient_id}.json"
    if file_path.exists():
        with open(file_path, encoding="utf-8") as f:
            data = json.load(f)
            _cache[patient_id] = data
            return data

    # 返回模拟患者
    if patient_id == MOCK_PATIENT["id"]:
        _cache[patient_id] = dict(MOCK_PATIENT)
        return MOCK_PATIENT

    return None


def save_patient(data: dict[str, Any]) -> str:
    """保存患者档案，返回 patient_id。"""
    pid = data.get("id", str(uuid.uuid4())[:8])
    data["id"] = pid
    data["updated_at"] = time.time()

    file_path = DATA_DIR / f"{pid}.json"
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    _cache[pid] = data
    return pid


def format_patient_context(patient: dict[str, Any] | None) -> str:
    """将患者档案格式化为 LLM 上下文。"""
    if not patient:
        return ""

    lines = [f"当前患者：{patient.get('name', '未知')}，{patient.get('gender', '')}，{patient.get('age', '')}岁"]
    lines.append(f"身高：{patient.get('height_cm', '?')}cm，体重：{patient.get('weight_kg', '?')}kg，BMI：{patient.get('bmi', '?')}")

    if patient.get("medical_history"):
        lines.append("既往病史：")
        for h in patient["medical_history"]:
            lines.append(f"  - {h['disease']}（{h.get('status', '')}）")

    if patient.get("medications"):
        drugs = [m["drug"] for m in patient["medications"]]
        lines.append(f"当前用药（{len(drugs)}种）：{', '.join(drugs)}")

    if patient.get("recent_exam"):
        exam = patient["recent_exam"]
        lines.append(f"最近体检（{exam.get('date', '?')}）：血压{exam.get('blood_pressure', '?')}，空腹血糖{exam.get('fasting_glucose', '?')}mmol/L，HbA1c {exam.get('hba1c', '?')}%")

    if patient.get("recent_symptoms"):
        lines.append("近两周症状：")
        for s in patient["recent_symptoms"]:
            lines.append(f"  - {s}")

    return "\n".join(lines)
