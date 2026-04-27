from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CategoryCreate(BaseModel):
    name: str
    description: str = ""
    color: str = "#6366f1"


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None


class CategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = ""
    color: str
    is_active: bool = True
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
