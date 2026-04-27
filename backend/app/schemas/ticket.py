from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TicketCreate(BaseModel):
    title: str
    description: str = ""
    priority: str = "medium"  # low | medium | high | urgent
    category_id: Optional[int] = None


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category_id: Optional[int] = None
    assignee_id: Optional[int] = None


class TicketAssign(BaseModel):
    assignee_id: int


class TicketTransfer(BaseModel):
    assignee_id: int
    reason: str = ""


class UserBrief(BaseModel):
    id: int
    name: Optional[str] = ""
    email: str
    avatar_url: Optional[str] = ""

    model_config = {"from_attributes": True}


class CategoryBrief(BaseModel):
    id: int
    name: str
    color: str

    model_config = {"from_attributes": True}


class TicketOut(BaseModel):
    id: int
    ticket_number: str
    title: str
    description: str
    status: str
    priority: str
    category: Optional[CategoryBrief] = None
    creator: Optional[UserBrief] = None
    assignee: Optional[UserBrief] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    comment_count: int = 0
    attachment_count: int = 0

    model_config = {"from_attributes": True}


class TicketListOut(BaseModel):
    tickets: List[TicketOut]
    total: int
    page: int
    page_size: int
