import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Northwind AI Enterprise Platform API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://northwind:northwind123@postgres:5432/northwind")
    MCP_SERVER_URL: str = os.getenv("MCP_SERVER_URL", "http://mcp-server:8001")
    AI_ORCHESTRATOR_URL: str = os.getenv("AI_ORCHESTRATOR_URL", "http://ai-orchestrator:8002")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-1234567890")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    class Config:
        case_sensitive = True

settings = Settings()
