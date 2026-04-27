"""
OAuth2 PKCE authentication flow with BasaltPass.

Flow:
1. GET /api/auth/login → redirect to BasaltPass authorize
2. GET /api/auth/callback → exchange code for token, upsert user, set JWT cookie
3. POST /api/auth/logout → clear JWT cookie
4. GET /api/auth/me → return current user
"""

import hashlib
import logging
import secrets
import base64
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import RedirectResponse
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.middleware.auth import create_jwt_token, get_current_user
from app.models.user import User
from app.schemas.user import UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])
logger = logging.getLogger(__name__)


def _frontend_login_error_url(error: str) -> str:
    return f"{settings.FRONTEND_URL.rstrip('/')}/login?error={error}"


def _is_browser_navigation(request: Request) -> bool:
    sec_fetch_mode = (request.headers.get("sec-fetch-mode") or "").lower()
    sec_fetch_dest = (request.headers.get("sec-fetch-dest") or "").lower()
    if sec_fetch_mode == "navigate" or sec_fetch_dest == "document":
        return True

    accept = (request.headers.get("accept") or "").lower()
    user_agent = request.headers.get("user-agent") or ""
    return "text/html" in accept and bool(user_agent)


def _generate_pkce():
    """Generate RFC7636 PKCE verifier/challenge pair (BASE64URL SHA-256)."""
    verifier = secrets.token_urlsafe(32)
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    return verifier, challenge


def _effective_session_samesite() -> str:
    samesite = settings.SESSION_COOKIE_SAMESITE
    if samesite not in {"lax", "strict", "none"}:
        return "lax"
    # Browsers reject SameSite=None without Secure.
    if samesite == "none" and not settings.SESSION_COOKIE_SECURE:
        return "lax"
    return samesite


def _set_oauth_context_cookie(response: Response, state: str, verifier: str) -> None:
    payload = {
        "state": state,
        "verifier": verifier,
        "exp": datetime.now(timezone.utc) + timedelta(seconds=settings.OAUTH_COOKIE_MAX_AGE),
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    response.set_cookie(
        key=settings.OAUTH_COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.OAUTH_COOKIE_MAX_AGE,
        path="/api/auth",
        samesite="lax",
        secure=settings.SESSION_COOKIE_SECURE,
        domain=settings.SESSION_COOKIE_DOMAIN,
    )


def _read_oauth_context_cookie(request: Request, state: str) -> str | None:
    token = request.cookies.get(settings.OAUTH_COOKIE_NAME)
    if not token:
        return None

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None

    if payload.get("state") != state:
        return None

    verifier = payload.get("verifier")
    if not isinstance(verifier, str) or not verifier:
        return None
    return verifier


def _clear_oauth_context_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.OAUTH_COOKIE_NAME,
        path="/api/auth",
        domain=settings.SESSION_COOKIE_DOMAIN,
    )


def _set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.JWT_EXPIRE_HOURS * 3600,
        path="/",
        samesite=_effective_session_samesite(),
        secure=settings.SESSION_COOKIE_SECURE,
        domain=settings.SESSION_COOKIE_DOMAIN,
    )


def _clear_session_cookie(response: Response) -> None:
    for path in ("/", "/api"):
        response.delete_cookie(
            key=settings.SESSION_COOKIE_NAME,
            path=path,
            domain=settings.SESSION_COOKIE_DOMAIN,
        )
    # Legacy name cleanup for compatibility with old deployments.
    for path in ("/", "/api"):
        response.delete_cookie(
            key="issuetick_session",
            path=path,
            domain=settings.SESSION_COOKIE_DOMAIN,
        )


@router.get("/login")
async def login():
    """Initiate OAuth2 PKCE login flow."""
    state = secrets.token_urlsafe(16)
    verifier, challenge = _generate_pkce()

    params = {
        "client_id": settings.BASALT_CLIENT_ID,
        "redirect_uri": settings.BASALT_REDIRECT_URI,
        "response_type": "code",
        "state": state,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
        "scope": "openid profile email",
    }

    auth_url = f"{settings.BASALT_BASE_URL}/api/v1/oauth/authorize?{urlencode(params)}"
    response = RedirectResponse(url=auth_url, status_code=302)
    _set_oauth_context_cookie(response, state, verifier)
    return response


@router.get("/callback")
async def callback(code: str, state: str, request: Request, db: Session = Depends(get_db)):
    """Handle BasaltPass OAuth callback."""

    # Ignore non-navigation requests to avoid consuming one-time auth codes.
    if not _is_browser_navigation(request):
        return Response(content='{"ok": false, "ignored": true, "reason": "non_navigation_callback"}', media_type="application/json")

    # Validate state
    verifier = _read_oauth_context_cookie(request, state)
    if verifier is None:
        logger.warning("OAuth callback rejected: invalid state or missing oauth context cookie")
        response = RedirectResponse(url=_frontend_login_error_url("invalid_state"), status_code=302)
        _clear_oauth_context_cookie(response)
        return response

    # Exchange code for tokens
    async with httpx.AsyncClient(timeout=10.0) as client:
        payload = {
            "grant_type": "authorization_code",
            "client_id": settings.BASALT_CLIENT_ID,
            "client_secret": settings.BASALT_CLIENT_SECRET,
            "redirect_uri": settings.BASALT_REDIRECT_URI,
            "code": code,
            "code_verifier": verifier,
        }
        token_resp = await client.post(
            f"{settings.BASALT_BASE_URL}/api/v1/oauth/token",
            data=payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        if token_resp.status_code != 200:
            logger.error("OAuth token exchange failed with status %s: %s", token_resp.status_code, token_resp.text)
            response = RedirectResponse(
                url=_frontend_login_error_url(f"token_exchange_failed_{token_resp.status_code}"),
                status_code=302,
            )
            _clear_oauth_context_cookie(response)
            return response

        token_data = token_resp.json()
        access_token = token_data.get("access_token")

        # Fetch user info
        userinfo_resp = await client.get(
            f"{settings.BASALT_BASE_URL}/api/v1/oauth/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if userinfo_resp.status_code != 200:
            logger.error("OAuth userinfo request failed with status %s: %s", userinfo_resp.status_code, userinfo_resp.text)
            response = RedirectResponse(
                url=_frontend_login_error_url(f"userinfo_failed_{userinfo_resp.status_code}"),
                status_code=302,
            )
            _clear_oauth_context_cookie(response)
            return response

        userinfo = userinfo_resp.json()

    # Upsert user
    basalt_id = str(userinfo.get("sub", ""))
    email = userinfo.get("email", "")
    name = userinfo.get("name", "") or userinfo.get("nickname", "")
    avatar_url = userinfo.get("avatar_url", "") or userinfo.get("picture", "")

    user = db.query(User).filter(User.basalt_id == basalt_id).first()
    if user is None:
        # Check if this is the first user — make them admin
        user_count = db.query(User).count()
        user = User(
            basalt_id=basalt_id,
            email=email,
            name=name,
            avatar_url=avatar_url,
            role="admin" if user_count == 0 else "user",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.email = email
        user.name = name
        user.avatar_url = avatar_url
        db.commit()
        db.refresh(user)

    # Create local JWT
    jwt_token = create_jwt_token(user.id, user.email)

    # Redirect to frontend with cookie
    response = RedirectResponse(url=settings.FRONTEND_URL, status_code=302)
    _clear_oauth_context_cookie(response)
    _set_session_cookie(response, jwt_token)
    return response


@router.post("/logout")
async def logout():
    """Clear session cookie."""
    response = Response(content='{"message": "Logged out"}', media_type="application/json")
    _clear_oauth_context_cookie(response)
    _clear_session_cookie(response)
    return response


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    """Return current authenticated user."""
    return current_user
