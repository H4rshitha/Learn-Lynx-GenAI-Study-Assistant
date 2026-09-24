import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Production Application Configuration using Pydantic BaseSettings.
    Automatically loads environment variables from .env file.
    """
    PROJECT_NAME: str = "Learn-Lynx GenAI Study Assistant"
    PROJECT_DESCRIPTION: str = (
        "Enterprise-grade Agentic AI Learning Assistant with Hybrid RAG, LangGraph Multi-Agent Workflows, "
        "Persistent Memory, Automated LLM-as-a-Judge Evaluation, Responsible AI Guardrails, and Analytics."
    )
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "production"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite:///./learnlynx.db"

    # Security & JWT Authentication
    JWT_SECRET_KEY: str = "learn-lynx-super-secret-production-grade-jwt-key-2026-change-in-prod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS Allowed Origins
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    # AI Models & Vector Databases
    GEMINI_API_KEY: str = ""
    EMBEDDING_MODEL: str = "text-embedding-004"
    RERANKER_MODEL: str = "BAAI/bge-reranker-large"
    CHROMA_PERSIST_DIRECTORY: str = "./data/chroma_db"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - [%(levelname)s] - %(name)s - %(message)s"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
