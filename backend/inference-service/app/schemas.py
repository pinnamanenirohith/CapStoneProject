from pydantic import BaseModel
from typing import Any, Optional

class InferenceRequest(BaseModel):
    inputs: Any
    parameters: Optional[dict] = {}

class InferenceResponse(BaseModel):
    model_name: str
    model_version: str
    prediction: Any
    confidence: Optional[float] = None
    latency_ms: float

class HealthResponse(BaseModel):
    status: str
    service: str
    loaded_models: list[str]
