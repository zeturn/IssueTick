"""Admin API — user management + stats."""

import os
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy import func as sqlfunc
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.middleware.auth import get_current_user, require_admin, require_lead_or_above
from app.models.user import User
from app.models.ticket import Ticket
from app.models.attachment import Attachment
from app.schemas.user import UserOut, UserUpdate

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=List[UserOut])
async def list_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List all users (admin only)."""
    return db.query(User).order_by(User.created_at.desc()).all()


@router.patch("/users/{user_id}", response_model=UserOut)
async def update_user_role(
    user_id: int,
    data: UserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update user role (admin only)."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot modify your own role")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    valid_roles = {"user", "handler", "lead", "admin"}
    if data.role and data.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}")

    if data.role:
        user.role = data.role

    db.commit()
    db.refresh(user)
    return user


@router.get("/handlers", response_model=List[UserOut])
async def list_handlers(
    current_user: User = Depends(require_lead_or_above),
    db: Session = Depends(get_db),
):
    """List all handlers/leads/admins for assignment dropdowns."""
    return (
        db.query(User)
        .filter(User.role.in_(["handler", "lead", "admin"]))
        .order_by(User.name)
        .all()
    )


@router.get("/stats")
async def get_stats(
    current_user: User = Depends(require_lead_or_above),
    db: Session = Depends(get_db),
):
    """Get dashboard statistics."""
    total_tickets = db.query(sqlfunc.count(Ticket.id)).scalar() or 0
    open_tickets = (
        db.query(sqlfunc.count(Ticket.id))
        .filter(Ticket.status.in_(["new", "assigned", "in_progress", "pending_user"]))
        .scalar() or 0
    )
    resolved_tickets = (
        db.query(sqlfunc.count(Ticket.id))
        .filter(Ticket.status == "resolved")
        .scalar() or 0
    )
    closed_tickets = (
        db.query(sqlfunc.count(Ticket.id))
        .filter(Ticket.status == "closed")
        .scalar() or 0
    )

    # By status breakdown
    status_counts = (
        db.query(Ticket.status, sqlfunc.count(Ticket.id))
        .group_by(Ticket.status)
        .all()
    )

    # By priority breakdown
    priority_counts = (
        db.query(Ticket.priority, sqlfunc.count(Ticket.id))
        .group_by(Ticket.priority)
        .all()
    )

    # Total users
    total_users = db.query(sqlfunc.count(User.id)).scalar() or 0

    return {
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "resolved_tickets": resolved_tickets,
        "closed_tickets": closed_tickets,
        "total_users": total_users,
        "by_status": {s: c for s, c in status_counts},
        "by_priority": {p: c for p, c in priority_counts},
    }


# ── Attachment endpoints (placed here for convenience) ──

upload_router = APIRouter(tags=["attachments"])


@upload_router.post("/api/tickets/{ticket_id}/attachments")
async def upload_attachment(
    ticket_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload an attachment to a ticket."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Access control
    if current_user.role == "user" and ticket.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Read file
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "file")[1]
    safe_name = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, safe_name)

    with open(filepath, "wb") as f:
        f.write(content)

    attachment = Attachment(
        ticket_id=ticket_id,
        filename=file.filename or "unknown",
        filepath=safe_name,
        filesize=len(content),
        mimetype=file.content_type or "application/octet-stream",
        uploaded_by=current_user.id,
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return {
        "id": attachment.id,
        "filename": attachment.filename,
        "filesize": attachment.filesize,
        "mimetype": attachment.mimetype,
    }


@upload_router.get("/api/attachments/{attachment_id}/download")
async def download_attachment(
    attachment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Download an attachment."""
    attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    filepath = os.path.join(settings.UPLOAD_DIR, attachment.filepath)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        path=filepath,
        filename=attachment.filename,
        media_type=attachment.mimetype,
    )
