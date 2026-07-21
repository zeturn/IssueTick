import os
from urllib.parse import quote_plus
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


class Settings:
    BASALT_BASE_URL: str = os.getenv("BASALT_BASE_URL", "http://localhost:8101")
    BASALT_CLIENT_ID: str = os.getenv("BASALT_CLIENT_ID", "")
    BASALT_CLIENT_SECRET: str = os.getenv("BASALT_CLIENT_SECRET", "")
    BASALT_REDIRECT_URI: str = os.getenv("BASALT_REDIRECT_URI", "http://localhost:8112/api/auth/callback")
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

    def database_url(self) -> str:
        mysql_host = os.getenv("MYSQL_HOST", "").strip()
        mysql_user = os.getenv("MYSQL_USERNAME", "").strip()
        mysql_password = os.getenv("MYSQL_PASSWORD", "")
        mysql_database = os.getenv("MYSQL_DATABASE", "").strip()
        mysql_port = os.getenv("MYSQL_PORT", "3306").strip() or "3306"
        if mysql_host and mysql_user and mysql_database:
            return (
                "mysql+pymysql://"
                f"{quote_plus(mysql_user)}:{quote_plus(mysql_password)}"
                f"@{mysql_host}:{mysql_port}/{mysql_database}?charset=utf8mb4"
            )
        return self.DATABASE_URL


settings = Settings()
