from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import time

from .schemas import InferenceRequest, InferenceResponse, HealthResponse
from .model_engine import engine

SECRET_KEY = "capstone-secret-key-change-in-production"
ALGORITHM  = "HS256"

app = FastAPI(
    title="Inference Service",
    description="Cloud-Native AI Model Inference Microservice — KL University Capstone",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

bearer = HTTPBearer(auto_error=False)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@app.get("/health", response_model=HealthResponse, tags=["System"])
def health():
    return HealthResponse(
        status="ok",
        service="inference-service",
        loaded_models=engine.loaded_models(),
    )


@app.get("/api/v1/inference/models", tags=["Inference"])
def list_models(_: dict = Depends(verify_token)):
    return {"models": engine.loaded_models()}


@app.post("/api/v1/inference/{model_name}", response_model=InferenceResponse, tags=["Inference"])
def predict(model_name: str, request: InferenceRequest, _: dict = Depends(verify_token)):
    try:
        result = engine.predict(model_name, request.inputs, request.parameters or {})
        return InferenceResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")


@app.get("/metrics/summary", tags=["System"])
def metrics_summary():
    """Lightweight metrics endpoint — full Prometheus metrics on /metrics via instrumentator."""
    return {
        "loaded_models": len(engine.loaded_models()),
        "service": "inference-service",
        "uptime_note": "See /metrics for Prometheus-format metrics",
    }
