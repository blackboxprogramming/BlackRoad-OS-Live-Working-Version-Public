"""Application configuration"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""

    # Application
    APP_NAME: str = "BlackRoad Operating System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # Database
    # Provide sensible defaults so local development and tests can run
    # without requiring environment configuration.
    DATABASE_URL: str = "sqlite:///./test.db"
    DATABASE_ASYNC_URL: str = "sqlite+aiosqlite:///./test.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security
    SECRET_KEY: str = "local-dev-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    WALLET_MASTER_KEY: str = "local-wallet-master-key-32chars-0000"

    # CORS
    # Include production domains by default to ensure Railway deployments work
    ALLOWED_ORIGINS: str = (
        "https://blackroad.systems,"
        "https://app.blackroad.systems,"
        "https://www.blackroad.systems,"
        "https://os.blackroad.systems,"
        "https://blackroad-operating-system-production.up.railway.app,"
        "https://fastapi-production-3753.up.railway.app,"
        "https://hello-world-production-789d.up.railway.app,"
        "https://nodejs-production-2a66.up.railway.app,"
        "https://serene-success-production.up.railway.app,"
        "http://localhost:3000,"
        "http://localhost:8000"
    )

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    # Prism / Status page targets
    PRISM_CORE_API_URL: str = ""
    PRISM_PUBLIC_API_URL: str = ""
    PRISM_CONSOLE_URL: str = ""

    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "blackroad-files"

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@blackroad.com"

    # OpenAI
    OPENAI_API_KEY: str = ""

    # Blockchain
    BLOCKCHAIN_DIFFICULTY: int = 4
    MINING_REWARD: float = 50.0

    # GitHub Automation (Phase Q)
    GITHUB_TOKEN: str = ""
    GITHUB_WEBHOOK_SECRET: str = ""

    # Ollama local LLM
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_DEFAULT_MODEL: str = "llama3"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Allow extra env vars in .env file


settings = Settings()
