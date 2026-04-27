from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, func

from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True, default="")
    color = Column(String(7), nullable=False, default="#6366f1")  # Hex color
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
