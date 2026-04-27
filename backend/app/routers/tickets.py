"""Ticket CRUD and state transition API."""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user, require_handler_or_above, require_lead_or_above
from app.models.ticket import Ticket
from app.models.comment import Comment
from app.models.user import User
from app.schemas.ticket import (
    TicketCreate, TicketUpdate, TicketOut, TicketListOut,
    TicketAssign, TicketTransfer,
)
from app.services.ticket_service import (
    generate_ticket_number, validate_status_transition,
    get_tickets_for_user, enrich_ticket_counts,
    VALID_STATUSES, VALID_PRIORITIES,
)

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


@router.get("", response_model=TicketListOut)
async def list_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List tickets based on user role."""
    tickets, total = get_tickets_for_user(
        db, current_user,
        page=page, page_size=page_size,
        status_filter=status_filter,
        priority_filter=priority,
        search=search,
    )

    ticket_list = [enrich_ticket_counts(db, t) for t in tickets]

    return TicketListOut(
        tickets=ticket_list,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    data: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new ticket."""
    if data.priority not in VALID_PRIORITIES:
        raise HTTPException(status_code=400, detail=f"Invalid priority. Must be one of: {', '.join(VALID_PRIORITIES)}")

    ticket = Ticket(
        ticket_number=generate_ticket_number(db),
        title=data.title,
        description=data.description,
        priority=data.priority,
        category_id=data.category_id,
        creator_id=current_user.id,
        status="new",
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return enrich_ticket_counts(db, ticket)


@router.get("/{ticket_id}", response_model=TicketOut)
async def get_ticket(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get ticket detail."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Access control
    if current_user.role == "user" and ticket.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user.role == "handler" and ticket.assignee_id != current_user.id and ticket.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return enrich_ticket_counts(db, ticket)


@router.patch("/{ticket_id}", response_model=TicketOut)
async def update_ticket(
    ticket_id: int,
    data: TicketUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update ticket (status, priority, etc.)."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Status change validation
    if data.status is not None:
        if data.status not in VALID_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid status: {data.status}")

        # Users can only: cancel their own (new) tickets, confirm resolved→closed, reopen resolved→in_progress
        if current_user.role == "user":
            allowed_user_transitions = {
                ("new", "cancelled"),
                ("resolved", "closed"),
                ("resolved", "in_progress"),
                ("pending_user", "in_progress"),
            }
            if ticket.creator_id != current_user.id:
                raise HTTPException(status_code=403, detail="Access denied")
            if (ticket.status, data.status) not in allowed_user_transitions:
                raise HTTPException(status_code=400, detail="Invalid status transition for user")
        elif current_user.role in ("handler", "lead", "admin"):
            if not validate_status_transition(ticket.status, data.status):
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot transition from '{ticket.status}' to '{data.status}'",
                )
        else:
            raise HTTPException(status_code=403, detail="Access denied")

        ticket.status = data.status

        # Track timestamps
        if data.status == "resolved":
            ticket.resolved_at = datetime.now(timezone.utc)
        elif data.status == "closed":
            ticket.closed_at = datetime.now(timezone.utc)

    # Only handler+ can change other fields
    if current_user.role in ("handler", "lead", "admin"):
        if data.title is not None:
            ticket.title = data.title
        if data.description is not None:
            ticket.description = data.description
        if data.priority is not None:
            if data.priority not in VALID_PRIORITIES:
                raise HTTPException(status_code=400, detail="Invalid priority")
            ticket.priority = data.priority
        if data.category_id is not None:
            ticket.category_id = data.category_id
        if data.assignee_id is not None and current_user.role in ("lead", "admin"):
            ticket.assignee_id = data.assignee_id
            if ticket.status == "new":
                ticket.status = "assigned"

    db.commit()
    db.refresh(ticket)
    return enrich_ticket_counts(db, ticket)


@router.post("/{ticket_id}/assign", response_model=TicketOut)
async def assign_ticket(
    ticket_id: int,
    data: TicketAssign,
    current_user: User = Depends(require_lead_or_above),
    db: Session = Depends(get_db),
):
    """Assign ticket to a handler."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    assignee = db.query(User).filter(User.id == data.assignee_id).first()
    if not assignee:
        raise HTTPException(status_code=404, detail="Assignee not found")
    if assignee.role not in ("handler", "lead", "admin"):
        raise HTTPException(status_code=400, detail="Assignee must be a handler or above")

    ticket.assignee_id = data.assignee_id
    if ticket.status == "new":
        ticket.status = "assigned"

    db.commit()
    db.refresh(ticket)
    return enrich_ticket_counts(db, ticket)


@router.post("/{ticket_id}/transfer", response_model=TicketOut)
async def transfer_ticket(
    ticket_id: int,
    data: TicketTransfer,
    current_user: User = Depends(require_lead_or_above),
    db: Session = Depends(get_db),
):
    """Transfer ticket to another handler."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    assignee = db.query(User).filter(User.id == data.assignee_id).first()
    if not assignee:
        raise HTTPException(status_code=404, detail="New assignee not found")
    if assignee.role not in ("handler", "lead", "admin"):
        raise HTTPException(status_code=400, detail="Assignee must be a handler or above")

    old_assignee_id = ticket.assignee_id
    ticket.assignee_id = data.assignee_id

    # Add a system comment about the transfer
    if data.reason:
        transfer_comment = Comment(
            ticket_id=ticket.id,
            user_id=current_user.id,
            content=f"Ticket transferred from user #{old_assignee_id} to user #{data.assignee_id}. Reason: {data.reason}",
            is_internal=True,
        )
        db.add(transfer_comment)

    db.commit()
    db.refresh(ticket)
    return enrich_ticket_counts(db, ticket)
