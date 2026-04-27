from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CommentCreate(BaseModel):
    content: str
    is_internal: bool = False


class UserBrief(BaseModel):
    id: int
    name: Optional[str] = ""
    email: str
    avatar_url: Optional[str] = ""

    model_config = {"from_attributes": True}


class CommentOut(BaseModel):
    id: int
    ticket_id: int
    user: Optional[UserBrief] = None
    content: str
    is_internal: bool = False
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
