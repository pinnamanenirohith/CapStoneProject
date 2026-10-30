from sqlalchemy import Column, Integer, String, DateTime, Text, Enum as SAEnum
from sqlalchemy.sql import func
import enum
from .database import Base

class ModelStatus(str, enum.Enum):
    pending  = "pending"
    deployed = "deployed"
    failed   = "failed"
    archived = "archived"

class MLModel(Base):
    __tablename__ = "ml_models"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(255), nullable=False)
    version     = Column(String(50),  nullable=False)
    framework   = Column(String(100), nullable=False)
    description = Column(Text, default="")
    file_path   = Column(String(500), default="")
    size_mb     = Column(String(20),  default="Unknown")
    status      = Column(SAEnum(ModelStatus), default=ModelStatus.pending)
    uploaded_by = Column(String(100), default="admin")
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())
