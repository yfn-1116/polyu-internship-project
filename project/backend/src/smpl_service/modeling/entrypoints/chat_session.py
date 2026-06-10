"""对话会话管理 — 内存存储，重启后清空."""

from __future__ import annotations

import time
import uuid
from typing import Any

# 内存会话存储 (MVP 阶段)
_sessions: dict[str, dict[str, Any]] = {}


def create_session() -> str:
    """创建新会话，返回 session_id。"""
    sid = str(uuid.uuid4())[:8]
    _sessions[sid] = {
        "id": sid,
        "created_at": time.time(),
        "messages": [],
        "patient_id": None,
    }
    return sid


def get_session(sid: str) -> dict[str, Any] | None:
    return _sessions.get(sid)


def add_message(sid: str, role: str, content: str) -> None:
    """添加一条消息到会话历史。"""
    session = _sessions.get(sid)
    if not session:
        return
    session["messages"].append({
        "role": role,
        "content": content,
        "timestamp": time.time(),
    })
    # 只保留最近 20 条
    if len(session["messages"]) > 20:
        session["messages"] = session["messages"][-20:]


def get_chat_history(sid: str, max_turns: int = 5) -> str:
    """获取最近 N 轮对话的格式化文本。"""
    session = _sessions.get(sid)
    if not session:
        return ""
    msgs = session["messages"][-max_turns * 2:]  # N轮 = 2N条消息
    lines = []
    for m in msgs:
        role_label = "用户" if m["role"] == "user" else "助手"
        lines.append(f"{role_label}: {m['content'][:200]}")
    return "\n".join(lines)


def set_patient(sid: str, patient_id: str) -> None:
    session = _sessions.get(sid)
    if session:
        session["patient_id"] = patient_id


def get_patient_id(sid: str) -> str | None:
    session = _sessions.get(sid)
    return session.get("patient_id") if session else None
