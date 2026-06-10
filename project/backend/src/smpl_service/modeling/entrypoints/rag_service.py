"""RAG 检索服务 — ChromaDB 向量存储 + 语义检索."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import chromadb
from chromadb.config import Settings

from .llm_client import embed_texts

# ChromaDB 持久化目录
CHROMA_DIR = Path(__file__).resolve().parents[3] / "chroma_db"

# Collection 名称
COLLECTIONS = {
    "medical_kb": "医疗知识库（疾病/症状/导诊）",
    "drug_kb": "药品知识库",
    "rehab_kb": "康复动作知识库",
    "checkup_kb": "体检指标知识库",
    "geriatric_kb": "老年医学知识库",
}


def _get_client() -> chromadb.PersistentClient:
    os.makedirs(str(CHROMA_DIR), exist_ok=True)
    return chromadb.PersistentClient(
        path=str(CHROMA_DIR),
        settings=Settings(anonymized_telemetry=False),
    )


def search(query: str, top_k: int = 5, collections: list[str] | None = None) -> list[dict[str, Any]]:
    """语义检索 — 在指定 collection 中搜索 Top-K 相关文档。

    Args:
        query: 用户问题
        top_k: 返回文档数
        collections: 要搜索的 collection 列表，默认全部

    Returns:
        [{"content": str, "score": float, "collection": str, "metadata": dict}, ...]
    """
    try:
        client = _get_client()
        targets = collections or list(COLLECTIONS.keys())
        query_embedding = embed_texts([query])[0]

        results = []
        for coll_name in targets:
            try:
                coll = client.get_collection(coll_name)
                resp = coll.query(query_embeddings=[query_embedding], n_results=top_k)
                if resp and resp.get("documents") and resp["documents"][0]:
                    for i, doc in enumerate(resp["documents"][0]):
                        score = resp.get("distances", [[0.0]])[0][i] if resp.get("distances") else 0.0
                        meta = resp.get("metadatas", [[{}]])[0][i] if resp.get("metadatas") else {}
                        results.append({
                            "content": doc,
                            "score": float(score),
                            "collection": coll_name,
                            "metadata": meta,
                        })
            except Exception:
                # collection 不存在时跳过
                pass

        # 按相似度排序
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    except Exception:
        return []


def format_rag_context(results: list[dict[str, Any]], max_chars: int = 2000) -> str:
    """将检索结果格式化为 LLM 上下文片段。"""
    if not results:
        return ""

    lines = ["以下是与用户问题相关的医疗知识参考："]
    total = 0
    for r in results:
        snippet = r["content"][:400]
        lines.append(f"- [{r['collection']}] {snippet}")
        total += len(snippet)
        if total > max_chars:
            break

    return "\n".join(lines)


def index_documents(
    documents: list[dict[str, Any]],
    collection: str = "medical_kb",
) -> int:
    """将文档向量化并写入 ChromaDB。

    Args:
        documents: [{"content": str, "metadata": dict}, ...]
        collection: 目标 collection 名称

    Returns:
        写入的文档数量
    """
    if not documents:
        return 0

    client = _get_client()
    coll = client.get_or_create_collection(collection)

    texts = [d["content"] for d in documents]
    embeddings = embed_texts(texts)
    metadatas = [d.get("metadata", {}) for d in documents]
    ids = [f"{collection}_{i}" for i in range(len(documents))]

    coll.add(embeddings=embeddings, documents=texts, metadatas=metadatas, ids=ids)

    return len(documents)


def get_collection_stats() -> dict[str, int]:
    """获取各 collection 的文档数量统计。"""
    stats = {}
    try:
        client = _get_client()
        for name in COLLECTIONS:
            try:
                coll = client.get_collection(name)
                stats[name] = coll.count()
            except Exception:
                stats[name] = 0
    except Exception:
        pass
    return stats
