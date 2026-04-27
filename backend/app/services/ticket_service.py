"""Ticket service — business logic for ticket CRUD and state transitions."""

from datetime import datetime, timezone
from typing import Optional, Tuple, List

from sqlalchemy import func as sqlfunc
from sqlalchemy.orm import Session

from app.models.ticket import Ticket
from app.models.comment import Comment
from app.models.user import User

# Valid status transitions
VALID_TRANSITIONS = {
    "new": ["assigned", "cancelled"],
    "assigned": ["in_progress", "cancelled"],
    "in_progress": ["pending_user", "resolved"],
    "pending_user": ["in_progress"],
    "resolved": ["closed", "in_progress"],
    "closed": [],
    "cancelled": [],
}

VALID_STATUSES = set(VALID_TRANSITIONS.keys())
VALID_PRIORITIES = {"low", "medium", "high", "urgent"}


def generate_ticket_number(db: Session) -> str:
    """Generate the next ticket number like IT-00001."""
    last = db.query(Ticket).order_by(Ticket.id.desc()).first()
    next_num = (last.id + 1) if last else 1
    return f"IT-{next_num:05d}"


def validate_status_transition(current: str, target: str) -> bool:
    """Check if a status transition is valid."""
    return target in VALID_TRANSITIONS.get(current, [])


def get_tickets_for_user(
    db: Session,
    user: User,
    page: int = 1,
    page_size: int = 20,
    status_filter: Optional[str] = None,
    priority_filter: Optional[str] = None,
    search: Optional[str] = None,
) -> Tuple[List[Ticket], int]:
    """Get tickets based on user role with filtering."""
    query = db.query(Ticket)

    # Role-based filtering
    if user.role == "user":
        query = query.filter(Ticket.creator_id == user.id)
    elif user.role == "handler":
        query = query.filter(
            (Ticket.assignee_id == user.id) | (Ticket.creator_id == user.id)
        )
    # lead and admin can see all tickets

    # Apply filters
    if status_filter and status_filter in VALID_STATUSES:
        query = query.filter(Ticket.status == status_filter)
    if priority_filter and priority_filter in VALID_PRIORITIES:
        query = query.filter(Ticket.priority == priority_filter)
    if search:
        query = query.filter(
            (Ticket.title.ilike(f"%{search}%"))
            | (Ticket.ticket_number.ilike(f"%{search}%"))
        )

    # Count total before pagination
    total = query.count()

    # Order and paginate
    tickets = (
        query.order_by(Ticket.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return tickets, total


def enrich_ticket_counts(db: Session, ticket: Ticket) -> dict:
    """Add comment_count and attachment_count to ticket data."""
    comment_count = db.query(sqlfunc.count(Comment.id)).filter(Comment.ticket_id == ticket.id).scalar() or 0
    from app.models.attachment import Attachment
    attachment_count = db.query(sqlfunc.count(Attachment.id)).filter(Attachment.ticket_id == ticket.id).scalar() or 0

    return {
        "id": ticket.id,
        "ticket_number": ticket.ticket_number,
        "title": ticket.title,
        "description": ticket.description,
        "status": ticket.status,
        "priority": ticket.priority,
        "category": ticket.category,
        "creator": ticket.creator,
        "assignee": ticket.assignee,
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at,
        "resolved_at": ticket.resolved_at,
        "closed_at": ticket.closed_at,
        "comment_count": comment_count,
        "attachment_count": attachment_count,
    }
