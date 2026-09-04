import pytest
from fastapi.testclient import TestClient
from jose import jwt
from datetime import datetime, timedelta, timezone

from app.main import app, SECRET_KEY, ALGORITHM

client = TestClient(app)

def make_token(role="ADMIN"):
    exp = datetime.now(timezone.utc) + timedelta(hours=1)
    return jwt.encode({"sub": "testuser", "role": role, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)

AUTH = {"Authorization": f"Bearer {make_token()}"}


class TestHealth:
    def test_health_returns_ok(self):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"
        assert r.json()["service"] == "inference-service"

    def test_health_lists_models(self):
        r = client.get("/health")
        assert len(r.json()["loaded_models"]) > 0


class TestAuth:
    def test_inference_requires_token(self):
        r = client.post("/api/v1/inference/resnet50", json={"inputs": {}})
        assert r.status_code == 401

    def test_inference_rejects_bad_token(self):
        r = client.post("/api/v1/inference/resnet50",
                        headers={"Authorization": "Bearer bad-token"},
                        json={"inputs": {}})
        assert r.status_code == 401


class TestInference:
    def test_resnet50_returns_prediction(self):
        r = client.post("/api/v1/inference/resnet50",
                        headers=AUTH,
                        json={"inputs": {"image_url": "http://example.com/cat.jpg"}})
        assert r.status_code == 200
        body = r.json()
        assert body["model_name"] == "ResNet-50 Image Classifier"
        assert "prediction" in body
        assert 0.0 <= body["confidence"] <= 1.0
        assert body["latency_ms"] > 0

    def test_bert_sentiment_positive(self):
        r = client.post("/api/v1/inference/bert-sentiment",
                        headers=AUTH,
                        json={"inputs": {"text": "This is great and awesome!"}})
        assert r.status_code == 200
        body = r.json()
        assert body["prediction"] in ["POSITIVE", "NEUTRAL", "NEGATIVE"]
        assert "confidence" in body

    def test_xgboost_fraud_returns_risk_level(self):
        r = client.post("/api/v1/inference/xgboost-fraud",
                        headers=AUTH,
                        json={"inputs": {"amount": 500.0, "merchant": "Grocery Store"}})
        assert r.status_code == 200
        body = r.json()
        assert body["prediction"] in ["FRAUD", "LEGITIMATE"]
        assert body.get("risk_level") in ["LOW", "MEDIUM", "HIGH"]

    def test_yolov8_returns_objects(self):
        r = client.post("/api/v1/inference/yolov8",
                        headers=AUTH,
                        json={"inputs": {"image_url": "http://example.com/street.jpg"},
                              "parameters": {"confidence": 0.5}})
        assert r.status_code == 200
        body = r.json()
        assert isinstance(body["prediction"], list)
        assert len(body["prediction"]) > 0

    def test_unknown_model_returns_404(self):
        r = client.post("/api/v1/inference/nonexistent-model",
                        headers=AUTH,
                        json={"inputs": {}})
        assert r.status_code == 404

    def test_list_models(self):
        r = client.get("/api/v1/inference/models", headers=AUTH)
        assert r.status_code == 200
        assert "models" in r.json()
        assert "resnet50" in r.json()["models"]
