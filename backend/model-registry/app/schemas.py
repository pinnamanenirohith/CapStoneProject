from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .models import ModelStatus

class ModelCreate(BaseModel):
    name: str
    version: str
    framework: str
    description: Optional[str] = ""
    size_mb: Optional[str] = "Unknown"

class ModelUpdate(BaseModel):
    status: Optional[ModelStatus] = None
    description: Optional[str] = None

class ModelOut(BaseModel):
    id: int
    name: str
    version: str
    framework: str
    description: str
    size_mb: str
    status: ModelStatus
    uploaded_by: str
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}
