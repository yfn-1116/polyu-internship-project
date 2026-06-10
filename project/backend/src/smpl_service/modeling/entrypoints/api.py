"""FastAPI endpoint — Layer 2: accepts beta/pose params, returns mesh vertices.

Start:  cd project/backend && PYTHONPATH=src uvicorn smpl_service.modeling.entrypoints.api:app --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure model module is importable
_model_src = str(Path(__file__).resolve().parents[5] / "model" / "src")
if _model_src not in sys.path:
    sys.path.insert(0, _model_src)

from smpl_model.app.smplx_interactive import generate_mesh, semantic_to_betas, set_joint_rotation

app = FastAPI(title="SMPL-X Interactive API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    betas: list[float] = Field(default_factory=lambda: [0.0] * 10, min_length=10, max_length=10)
    body_pose: list[float] = Field(default_factory=lambda: [0.0] * 63, min_length=63, max_length=63)
    gender: str = "neutral"


class SemanticRequest(BaseModel):
    height: float = 0.0
    weight: float = 0.0
    shoulder: float = 0.0
    waist: float = 0.0
    hip: float = 0.0
    body_pose: list[float] = Field(default_factory=lambda: [0.0] * 63, min_length=63, max_length=63)
    gender: str = "neutral"


class MeshResponse(BaseModel):
    vertices: list[list[float]]
    faces: list[list[int]]
    vertex_count: int
    face_count: int


def _build_response(vertices, faces) -> MeshResponse:
    return MeshResponse(
        vertices=vertices.tolist(),
        faces=faces.tolist(),
        vertex_count=int(vertices.shape[0]),
        face_count=int(faces.shape[0]),
    )


@app.post("/api/smplx/generate", response_model=MeshResponse)
def generate(req: GenerateRequest):
    """Generate mesh from raw SMPL-X parameters."""
    vertices, faces = generate_mesh(
        betas=req.betas,
        body_pose=req.body_pose,
        gender=req.gender,
    )
    return _build_response(vertices, faces)


@app.post("/api/smplx/generate-semantic", response_model=MeshResponse)
def generate_semantic(req: SemanticRequest):
    """Generate mesh from semantic sliders (height/weight/shoulder/waist/hip)."""
    betas = semantic_to_betas(
        height=req.height,
        weight=req.weight,
        shoulder=req.shoulder,
        waist=req.waist,
        hip=req.hip,
    )
    vertices, faces = generate_mesh(
        betas=betas,
        body_pose=req.body_pose,
        gender=req.gender,
    )
    return _build_response(vertices, faces)


@app.get("/api/health")
def health():
    return {"status": "ok"}
