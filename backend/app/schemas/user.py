from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserOut(BaseModel):
    id: int
    basalt_id: str
    email: str
    name: Optional[str] = ""
    avatar_url: Optional[str] = ""
    role: str = "user"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    role: Optional[str] = None  # admin can change roles
