"""Comments API for ticket discussions."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.ticket import Ticket
from app.models.comment import Comment
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentOut

router = APIRouter(prefix="/api/tickets/{ticket_id}/comments", tags=["comments"])


@router.get("", response_model=List[CommentOut])
async def list_comments(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all comments for a ticket."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Access control
    if current_user.role == "user" and ticket.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    comments = (
        db.query(Comment)
        .filter(Comment.ticket_id == ticket_id)
        .order_by(Comment.created_at.asc())
        .all()
    )

    # Filter out internal notes for regular users
    if current_user.role == "user":
        comments = [c for c in comments if not c.is_internal]

    return comments


@router.post("", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
async def create_comment(
    ticket_id: int,
    data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a comment to a ticket."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Access control
    if current_user.role == "user" and ticket.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Users cannot create internal notes
    if data.is_internal and current_user.role == "user":
        raise HTTPException(status_code=403, detail="Users cannot create internal notes")

    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Comment cannot be empty")

    comment = Comment(
        ticket_id=ticket_id,
        user_id=current_user.id,
        content=data.content.strip(),
        is_internal=data.is_internal,
    )
    db.add(comment)

    # If user replies while status is pending_user, move to in_progress
    if current_user.role == "user" and ticket.status == "pending_user":
        ticket.status = "in_progress"

    db.commit()
    db.refresh(comment)
    return comment
