"""
Mock ML model engine.
In production: load real model files (PyTorch, TensorFlow, ONNX) from Model Registry.
Each predict() simulates what a real model would return.
"""
import time, random, numpy as np
from typing import Any

class MockModelEngine:
    MODELS = {
        "resnet50": {
            "name": "ResNet-50 Image Classifier",
            "version": "v2.1.0",
            "framework": "PyTorch",
            "classes": ["cat", "dog", "car", "person", "bird"],
        },
        "bert-sentiment": {
            "name": "BERT Sentiment Analyzer",
            "version": "v1.3.2",
            "framework": "TensorFlow",
            "labels": ["NEGATIVE", "NEUTRAL", "POSITIVE"],
        },
        "xgboost-fraud": {
            "name": "XGBoost Fraud Detector",
            "version": "v3.0.0",
            "framework": "Scikit-learn",
        },
        "yolov8": {
            "name": "YOLOv8 Object Detector",
            "version": "v1.0.0",
            "framework": "PyTorch",
            "classes": ["person", "car", "bicycle", "dog", "cat"],
        },
    }

    def loaded_models(self) -> list[str]:
        return list(self.MODELS.keys())

    def predict(self, model_name: str, inputs: Any, parameters: dict) -> dict:
        if model_name not in self.MODELS:
            raise ValueError(f"Model '{model_name}' not found. Available: {self.loaded_models()}")

        start = time.perf_counter()
        result = self._run(model_name, inputs, parameters)
        latency_ms = round((time.perf_counter() - start) * 1000 + random.uniform(20, 80), 2)

        return {
            "model_name": self.MODELS[model_name]["name"],
            "model_version": self.MODELS[model_name]["version"],
            "latency_ms": latency_ms,
            **result,
        }

    def _run(self, name: str, inputs: Any, params: dict) -> dict:
        if name == "resnet50":
            classes = self.MODELS[name]["classes"]
            probs = np.random.dirichlet(np.ones(len(classes)))
            idx = int(np.argmax(probs))
            return {
                "prediction": classes[idx],
                "confidence": round(float(probs[idx]), 4),
                "class_id": idx,
                "probabilities": {c: round(float(p), 4) for c, p in zip(classes, probs)},
            }

        if name == "bert-sentiment":
            text = str(inputs.get("text", "")) if isinstance(inputs, dict) else str(inputs)
            # Simple heuristic for demo
            score = min(1.0, max(0.0, 0.5 + len([w for w in text.lower().split()
                if w in ("great","good","excellent","awesome","love","best")]) * 0.15
                - len([w for w in text.lower().split()
                if w in ("bad","terrible","awful","hate","worst","poor")]) * 0.15
                + random.uniform(-0.1, 0.1)))
            label = "POSITIVE" if score > 0.6 else "NEGATIVE" if score < 0.4 else "NEUTRAL"
            return {"prediction": label, "confidence": round(score, 4), "score": round(score, 4)}

        if name == "xgboost-fraud":
            amount = float(inputs.get("amount", 100)) if isinstance(inputs, dict) else 100.0
            prob = min(0.95, max(0.01, (amount / 10000) * 0.4 + random.uniform(0.01, 0.15)))
            fraud = prob > 0.5
            return {
                "prediction": "FRAUD" if fraud else "LEGITIMATE",
                "confidence": round(prob if fraud else 1 - prob, 4),
                "fraud_probability": round(prob, 4),
                "risk_level": "HIGH" if prob > 0.7 else "MEDIUM" if prob > 0.4 else "LOW",
            }

        if name == "yolov8":
            threshold = params.get("confidence", 0.5)
            objects = []
            for cls in random.sample(self.MODELS[name]["classes"], k=random.randint(1, 3)):
                conf = round(random.uniform(threshold, 0.99), 3)
                objects.append({
                    "label": cls,
                    "confidence": conf,
                    "bbox": [random.randint(0, 200), random.randint(0, 200),
                             random.randint(200, 600), random.randint(200, 500)],
                })
            return {"prediction": objects, "confidence": max(o["confidence"] for o in objects), "objects_detected": len(objects)}

        return {"prediction": "unknown"}


engine = MockModelEngine()
