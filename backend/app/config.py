import os
from dotenv import load_dotenv

load_dotenv()


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_optional(name: str):
    value = os.getenv(name)
    if value is None:
        return None
    value = value.strip()
    return value or None


def _env_first(*names: str, default: str = "") -> str:
    for name in names:
        value = os.getenv(name)
        if value is not None:
            return value
    return default


class Settings:
    BASALTPASS_BASE_URL: str = _env_first("BASALTPASS_BASE_URL", "BASALT_BASE_URL", default="http://localhost:8101")
    BASALTPASS_CLIENT_ID: str = _env_first("BASALTPASS_CLIENT_ID", "BASALT_CLIENT_ID")
    BASALTPASS_CLIENT_SECRET: str = _env_first("BASALTPASS_CLIENT_SECRET", "BASALT_CLIENT_SECRET")
    BASALTPASS_REDIRECT_URI: str = _env_first(
        "BASALTPASS_REDIRECT_URI",
        "BASALT_REDIRECT_URI",
        default="http://localhost:8112/api/auth/callback",
    )
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5115")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "issuetick-dev-jwt-secret-change-in-prod")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 72
    SESSION_COOKIE_NAME: str = os.getenv("SESSION_COOKIE_NAME", "issuetick_session")
    SESSION_COOKIE_DOMAIN = _env_optional("SESSION_COOKIE_DOMAIN")
    SESSION_COOKIE_SECURE: bool = _env_bool("SESSION_COOKIE_SECURE", False)
    SESSION_COOKIE_SAMESITE: str = os.getenv("SESSION_COOKIE_SAMESITE", "lax").strip().lower()
    OAUTH_COOKIE_NAME: str = os.getenv("OAUTH_COOKIE_NAME", "issuetick_oauth_ctx")
    OAUTH_COOKIE_MAX_AGE: int = int(os.getenv("OAUTH_COOKIE_MAX_AGE", "600"))
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./issuetick.db")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB


settings = Settings()
