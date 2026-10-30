import pytest
import os
os.environ["USE_SQLITE"] = "true"   # use in-memory SQLite for tests

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

# ── In-memory SQLite test DB ──────────────────────────────────────────────────
TEST_DB_URL = "sqlite:///./test_registry.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestSession()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


def login(username="admin", password="admin123"):
    r = client.post("/api/v1/auth/login",
                    data={"username": username, "password": password})
    assert r.status_code == 200
    return r.json()["access_token"]


class TestAuth:
    def test_login_admin_success(self):
        r = client.post("/api/v1/auth/login",
                        data={"username": "admin", "password": "admin123"})
        assert r.status_code == 200
        assert "access_token" in r.json()
        assert r.json()["role"] == "ADMIN"

    def test_login_user_success(self):
        r = client.post("/api/v1/auth/login",
                        data={"username": "user", "password": "user123"})
        assert r.status_code == 200
        assert r.json()["role"] == "USER"

    def test_login_wrong_password(self):
        r = client.post("/api/v1/auth/login",
                        data={"username": "admin", "password": "wrong"})
        assert r.status_code == 401

    def test_models_requires_auth(self):
        r = client.get("/api/v1/models")
        assert r.status_code == 401


class TestModelCRUD:
    def test_create_model(self):
        token = login()
        r = client.post("/api/v1/models",
                        headers={"Authorization": f"Bearer {token}"},
                        json={"name": "Test Model", "version": "v1.0.0",
                              "framework": "PyTorch", "description": "A test model"})
        assert r.status_code == 201
        body = r.json()
        assert body["name"] == "Test Model"
        assert body["status"] == "pending"
        assert body["uploaded_by"] == "admin"

    def test_list_models(self):
        token = login()
        headers = {"Authorization": f"Bearer {token}"}
        client.post("/api/v1/models", headers=headers,
                    json={"name": "Model A", "version": "v1.0", "framework": "TensorFlow"})
        client.post("/api/v1/models", headers=headers,
                    json={"name": "Model B", "version": "v2.0", "framework": "PyTorch"})
        r = client.get("/api/v1/models", headers=headers)
        assert r.status_code == 200
        assert len(r.json()) == 2

    def test_get_model_by_id(self):
        token = login()
        headers = {"Authorization": f"Bearer {token}"}
        created = client.post("/api/v1/models", headers=headers,
                              json={"name": "Fetch Me", "version": "v1", "framework": "ONNX"}).json()
        r = client.get(f"/api/v1/models/{created['id']}", headers=headers)
        assert r.status_code == 200
        assert r.json()["name"] == "Fetch Me"

    def test_get_nonexistent_model_returns_404(self):
        token = login()
        r = client.get("/api/v1/models/9999",
                       headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 404

    def test_update_model_status_admin(self):
        token = login()
        headers = {"Authorization": f"Bearer {token}"}
        created = client.post("/api/v1/models", headers=headers,
                              json={"name": "Update Me", "version": "v1", "framework": "PyTorch"}).json()
        r = client.patch(f"/api/v1/models/{created['id']}",
                         headers=headers, json={"status": "deployed"})
        assert r.status_code == 200
        assert r.json()["status"] == "deployed"

    def test_update_model_status_user_forbidden(self):
        admin_token = login()
        user_token  = login("user", "user123")
        created = client.post("/api/v1/models",
                              headers={"Authorization": f"Bearer {admin_token}"},
                              json={"name": "Restricted", "version": "v1", "framework": "PyTorch"}).json()
        r = client.patch(f"/api/v1/models/{created['id']}",
                         headers={"Authorization": f"Bearer {user_token}"},
                         json={"status": "deployed"})
        assert r.status_code == 403

    def test_delete_model_admin(self):
        token = login()
        headers = {"Authorization": f"Bearer {token}"}
        created = client.post("/api/v1/models", headers=headers,
                              json={"name": "Delete Me", "version": "v1", "framework": "PyTorch"}).json()
        r = client.delete(f"/api/v1/models/{created['id']}", headers=headers)
        assert r.status_code == 204
        r2 = client.get(f"/api/v1/models/{created['id']}", headers=headers)
        assert r2.status_code == 404

    def test_delete_model_user_forbidden(self):
        admin_token = login()
        user_token  = login("user", "user123")
        created = client.post("/api/v1/models",
                              headers={"Authorization": f"Bearer {admin_token}"},
                              json={"name": "No Delete", "version": "v1", "framework": "PyTorch"}).json()
        r = client.delete(f"/api/v1/models/{created['id']}",
                          headers={"Authorization": f"Bearer {user_token}"})
        assert r.status_code == 403


class TestHealth:
    def test_health(self):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"
