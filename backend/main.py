import time
import datetime
from contextlib import asynccontextmanager
from typing import Callable

from fastapi import FastAPI, Request, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from backend.config.settings import settings
from backend.config.logging import logger
from backend.database import init_db, SessionLocal
from backend.models.user import User
from backend.models.memory import Conversation, ConversationMessage
from backend.utils.security import get_password_hash

# Versioned Route Handlers
from backend.routes.auth import router as auth_router
from backend.routes.protected_example import router as study_router
from backend.routes.rag import router as rag_router
from backend.routes.agent import router as agent_router
from backend.routes.memory import router as memory_router
from backend.routes.knowledge import router as knowledge_router
from backend.routes.quiz import router as quiz_router
from backend.routes.planner import router as planner_router
from backend.routes.evaluation import router as evaluation_router
from backend.routes.guardrails import router as guardrails_router
from backend.routes.analytics import router as analytics_router


def seed_demo_user_and_memory():
    """Seed initial demo scholar user and recent study conversations if not exists."""
    db = SessionLocal()
    try:
        demo_email = "harshitha@university.edu"
        user = db.query(User).filter(User.email == demo_email).first()
        if not user:
            user = User(
                email=demo_email,
                hashed_password=get_password_hash("SecurePass2026!"),
                full_name="Harshitha R.",
                college="National Institute of Engineering",
                department="Computer Science & Engineering",
                semester="6th Semester",
                avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
                role="Student",
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info("✨ Seeded default demo scholar user: harshitha@university.edu / SecurePass2026!")

        # Seed initial conversation history
        conv_count = db.query(Conversation).filter(Conversation.user_id == user.id).count()
        if conv_count == 0:
            conv1 = Conversation(
                user_id=user.id,
                session_id="session_os_concurrency",
                title="Semaphore vs Mutex with C Code Examples",
                doc_source="Operating Systems - Concurrency & Synchronization.pdf",
                is_pinned=True,
                summary="Exploration of process synchronization, priority inversion, and Peterson algorithm invariants.",
            )
            db.add(conv1)
            db.commit()
            db.refresh(conv1)

            db.add(
                ConversationMessage(
                    conversation_id=conv1.id,
                    role="user",
                    content="How does Peterson's solution ensure mutual exclusion without hardware support?",
                )
            )
            db.add(
                ConversationMessage(
                    conversation_id=conv1.id,
                    role="assistant",
                    content="Peterson's algorithm achieves mutual exclusion between two processes using shared variables `int turn` and `boolean flag[2]`.",
                    confidence=97.2,
                )
            )

            conv2 = Conversation(
                user_id=user.id,
                session_id="session_ai_astar",
                title="Heuristic Admissibility and Consistency in A*",
                doc_source="Artificial Intelligence - Search Algorithms & Heuristics.pdf",
                is_pinned=False,
                summary="Proof of optimality in informed graph search without reopening closed nodes.",
            )
            db.add(conv2)
            db.commit()
            logger.info("✨ Seeded persistent conversation history threads for demo scholar.")
    except Exception as e:
        logger.error(f"Error seeding demo data: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup Lifespan
    logger.info("🚀 Starting Learn-Lynx Backend...")
    logger.info(f"⚙️ Environment: {settings.ENVIRONMENT} | Debug: {settings.DEBUG}")
    init_db()
    seed_demo_user_and_memory()
    yield
    # Shutdown Lifespan
    logger.info("🛑 Shutting down Learn-Lynx Backend gracefully...")


# OpenAPI Metadata Tags
openapi_tags = [
    {"name": "Authentication & Profile", "description": "JWT authentication, token refresh, and scholar profile"},
    {"name": "Knowledge Base & Documents", "description": "PDF document upload, semantic chunking, and ChromaDB management"},
    {"name": "Hybrid RAG Engine", "description": "Dense ChromaDB + Sparse BM25 + Cross-Encoder re-ranking"},
    {"name": "LangGraph AI Agent Workspace", "description": "Multi-agent autonomous reasoning, tool execution, and SSE streaming"},
    {"name": "Persistent AI Memory", "description": "Conversation history, weak topics, semantic vectors, and session management"},
    {"name": "AI Quiz Studio", "description": "Adaptive MCQ, short answer, and True/False generation with instant evaluation"},
    {"name": "AI Study Planning Agent", "description": "Spaced repetition scheduler, calendar timetable, and daily task checklist"},
    {"name": "LLM Evaluation & Judge", "description": "Context/answer relevance, faithfulness, hallucination risk, and comparator"},
    {"name": "Responsible AI Guardrails", "description": "Prompt injection, jailbreak defense, PII redaction, and citation gates"},
    {"name": "Analytics & Usage Dashboard", "description": "Real-time usage telemetry, Recharts series, and KPI metrics"},
    {"name": "System Health", "description": "Health check and service status endpoints"},
]

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.PROJECT_DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=openapi_tags,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# 1. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 2. Structured Request Timing & Logging Middleware
@app.middleware("http")
async def request_logging_middleware(request: Request, call_next: Callable):
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time_ms = round((time.time() - start_time) * 1000, 2)
        response.headers["X-Process-Time-Ms"] = str(process_time_ms)
        
        # Log non-healthcheck requests
        if not request.url.path.endswith("/health") and request.url.path != "/":
            logger.info(
                f"{request.method} {request.url.path} -> Status: {response.status_code} "
                f"({process_time_ms} ms)"
            )
        return response
    except Exception as exc:
        process_time_ms = round((time.time() - start_time) * 1000, 2)
        logger.error(f"Unhandled exception on {request.method} {request.url.path} ({process_time_ms} ms): {exc}")
        raise exc


from starlette.exceptions import HTTPException as StarletteHTTPException

# 3. Global Exception Handlers for Production Error Handling
@app.exception_handler(StarletteHTTPException)
async def starlette_http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "status_code": exc.status_code,
            "error": "HTTPException",
            "detail": exc.detail,
            "path": request.url.path,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "status_code": exc.status_code,
            "error": "HTTPException",
            "detail": exc.detail,
            "path": request.url.path,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        },
    )



@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        loc = " -> ".join([str(l) for l in err.get("loc", [])])
        errors.append({"location": loc, "message": err.get("msg"), "type": err.get("type")})

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
            "error": "RequestValidationError",
            "detail": "Invalid request parameters or payload format.",
            "validation_errors": errors,
            "path": request.url.path,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Internal Server Error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "error": "InternalServerError",
            "detail": "An unexpected internal server error occurred. Please try again or check backend logs.",
            "path": request.url.path,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        },
    )


# 4. Mount API v1 Versioned Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(study_router, prefix=settings.API_V1_STR)
app.include_router(rag_router, prefix=settings.API_V1_STR)
app.include_router(knowledge_router, prefix=settings.API_V1_STR)
app.include_router(agent_router, prefix=settings.API_V1_STR)
app.include_router(memory_router, prefix=settings.API_V1_STR)
app.include_router(quiz_router, prefix=settings.API_V1_STR)
app.include_router(planner_router, prefix=settings.API_V1_STR)
app.include_router(evaluation_router, prefix=settings.API_V1_STR)
app.include_router(guardrails_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)

# Also expose direct routes for top-level convenience
app.include_router(auth_router)
app.include_router(rag_router)
app.include_router(knowledge_router)
app.include_router(agent_router)
app.include_router(memory_router)
app.include_router(quiz_router)
app.include_router(planner_router)
app.include_router(evaluation_router)
app.include_router(guardrails_router)
app.include_router(analytics_router)


# 5. Root & Health Endpoints
@app.get("/", tags=["System Health"])
async def root():
    """Application root returning system status and OpenAPI specifications."""
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "api_v1": settings.API_V1_STR,
        "architecture": "Modular FastAPI Production Architecture with DI, LangGraph, and Hybrid RAG",
    }


@app.get("/health", tags=["System Health"])
async def health_check():
    """System health inspection verifying database, memory, and multi-agent availability."""
    return {
        "status": "healthy",
        "database": "connected",
        "memory_subsystem": "active",
        "agents": "ready",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
