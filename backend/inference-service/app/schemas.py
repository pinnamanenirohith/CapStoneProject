from pydantic import BaseModel, ConfigDict
from typing import Any, Optional

class InferenceRequest(BaseModel):
    inputs: Any
    parameters: Optional[dict] = {}

class InferenceResponse(BaseModel):
    model_config = ConfigDict(extra="allow")   # pass through model-specific fields

    model_name: str
    model_version: str
    prediction: Any
    confidence: Optional[float] = None
    latency_ms: float

class HealthResponse(BaseModel):
    status: str
    service: str
    loaded_models: list[str]
