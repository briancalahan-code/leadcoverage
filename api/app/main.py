from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes.ai import router as ai_router
from app.routes.clients import router as clients_router
from app.routes.integrations import router as integrations_router
from app.routes.jobs import router as jobs_router

app = FastAPI(title="LeadCoverage API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router)
app.include_router(clients_router)
app.include_router(integrations_router)
app.include_router(jobs_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
