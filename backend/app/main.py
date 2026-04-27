"""IssueTick — Ticket Management System Backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers.auth import router as auth_router
from app.routers.tickets import router as tickets_router
from app.routers.comments import router as comments_router
from app.routers.categories import router as categories_router
from app.routers.admin import router as admin_router, upload_router

app = FastAPI(
    title="IssueTick API",
    description="Ticket Management System",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5115"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(tickets_router)
app.include_router(comments_router)
app.include_router(categories_router)
app.include_router(admin_router)
app.include_router(upload_router)


@app.on_event("startup")
async def startup():
    """Initialize database on startup."""
    init_db()


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "issuetick"}
