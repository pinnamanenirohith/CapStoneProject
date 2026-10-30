from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import hashlib, os, aiofiles, uuid

from .database import engine, get_db, Base
from .models import MLModel, ModelStatus
from .schemas import ModelCreate, ModelUpdate, ModelOut

Base.metadata.create_all(bind=engine)

SECRET_KEY = os.getenv("SECRET_KEY", "capstone-secret-key-change-in-production")
ALGORITHM  = "HS256"
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

bearer = HTTPBearer(auto_error=False)

def _sha256(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()

# Hardcoded users — replace with DB users in production
USERS = {
    "admin": {"password_hash": _sha256("admin123"), "role": "ADMIN"},
    "user":  {"password_hash": _sha256("user123"),  "role": "USER"},
}

app = FastAPI(
    title="Model Registry Service",
    description="ML Model metadata store — KL University Capstone",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Auth helpers ─────────────────────────────────────────────────────────────

def create_token(username: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=8)
    return jwt.encode({"sub": username, "role": role, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        return jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin role required")
    return user


# ── Auth endpoints ────────────────────────────────────────────────────────────

from fastapi import Form

@app.post("/api/v1/auth/login", tags=["Auth"])
def login(username: str = Form(...), password: str = Form(...)):
    user = USERS.get(username)
    if not user or _sha256(password) != user["password_hash"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(username, user["role"])
    return {"access_token": token, "token_type": "bearer", "role": user["role"]}


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "service": "model-registry"}


# ── Model CRUD ────────────────────────────────────────────────────────────────

@app.get("/api/v1/models", response_model=list[ModelOut], tags=["Models"])
def list_models(db: Session = Depends(get_db), _: dict = Depends(get_current_user)):
    return db.query(MLModel).order_by(MLModel.created_at.desc()).all()


@app.get("/api/v1/models/{model_id}", response_model=ModelOut, tags=["Models"])
def get_model(model_id: int, db: Session = Depends(get_db), _: dict = Depends(get_current_user)):
    m = db.query(MLModel).filter(MLModel.id == model_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Model not found")
    return m


@app.post("/api/v1/models", response_model=ModelOut, status_code=201, tags=["Models"])
def create_model(data: ModelCreate, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    m = MLModel(**data.model_dump(), uploaded_by=user["sub"])
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@app.patch("/api/v1/models/{model_id}", response_model=ModelOut, tags=["Models"])
def update_model(model_id: int, data: ModelUpdate, db: Session = Depends(get_db), _: dict = Depends(require_admin)):
    m = db.query(MLModel).filter(MLModel.id == model_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Model not found")
    for field, val in data.model_dump(exclude_none=True).items():
        setattr(m, field, val)
    db.commit()
    db.refresh(m)
    return m


@app.delete("/api/v1/models/{model_id}", status_code=204, tags=["Models"])
def delete_model(model_id: int, db: Session = Depends(get_db), _: dict = Depends(require_admin)):
    m = db.query(MLModel).filter(MLModel.id == model_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Model not found")
    db.delete(m)
    db.commit()


@app.post("/api/v1/models/{model_id}/upload", tags=["Models"])
async def upload_model_file(model_id: int, file: UploadFile = File(...),
                             db: Session = Depends(get_db), _: dict = Depends(require_admin)):
    m = db.query(MLModel).filter(MLModel.id == model_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Model not found")
    ext = os.path.splitext(file.filename)[1]
    filename = f"{model_id}_{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    async with aiofiles.open(path, "wb") as f:
        await f.write(await file.read())
    size_mb = round(os.path.getsize(path) / 1_048_576, 2)
    m.file_path = path
    m.size_mb   = f"{size_mb} MB"
    m.status    = ModelStatus.deployed
    db.commit()
    db.refresh(m)
    return {"message": "File uploaded", "file": filename, "size_mb": size_mb}


# ── Seed data on startup ──────────────────────────────────────────────────────

@app.on_event("startup")
def seed():
    db = next(get_db())
    if db.query(MLModel).count() == 0:
        seeds = [
            MLModel(name="ResNet-50 Image Classifier", version="v2.1.0", framework="PyTorch",   size_mb="98 MB",  status=ModelStatus.deployed, uploaded_by="admin"),
            MLModel(name="BERT Sentiment Analyzer",    version="v1.3.2", framework="TensorFlow", size_mb="440 MB", status=ModelStatus.deployed, uploaded_by="admin"),
            MLModel(name="YOLOv8 Object Detector",     version="v1.0.0", framework="PyTorch",   size_mb="22 MB",  status=ModelStatus.pending,  uploaded_by="admin"),
            MLModel(name="XGBoost Fraud Detector",     version="v3.0.0", framework="Scikit-learn", size_mb="12 MB", status=ModelStatus.deployed, uploaded_by="admin"),
        ]
        db.add_all(seeds)
        db.commit()
    db.close()
