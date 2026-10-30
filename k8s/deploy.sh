#!/bin/bash
# deploy.sh — Apply all Kubernetes manifests in dependency order
# Usage:  ./k8s/deploy.sh
# Prereq: kubectl configured, images built and pushed to registry

set -e

NAMESPACE=capstone

echo "=== Cloud-Native AI Platform — Kubernetes Deploy ==="
echo ""

# 1. Namespace + Secrets
echo "[1/8] Creating namespace and secrets..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml

# 2. PostgreSQL (StatefulSet — must be ready before registry)
echo "[2/8] Deploying PostgreSQL..."
kubectl apply -f k8s/postgres/pvc.yaml
kubectl apply -f k8s/postgres/statefulset.yaml
kubectl apply -f k8s/postgres/service.yaml
kubectl rollout status statefulset/postgres -n $NAMESPACE --timeout=120s

# 3. Model Registry
echo "[3/8] Deploying Model Registry..."
kubectl apply -f k8s/model-registry/pvc.yaml
kubectl apply -f k8s/model-registry/deployment.yaml
kubectl apply -f k8s/model-registry/service.yaml
kubectl apply -f k8s/model-registry/hpa.yaml
kubectl rollout status deployment/model-registry -n $NAMESPACE --timeout=120s

# 4. Inference Service
echo "[4/8] Deploying Inference Service..."
kubectl apply -f k8s/inference-service/deployment.yaml
kubectl apply -f k8s/inference-service/service.yaml
kubectl apply -f k8s/inference-service/hpa.yaml
kubectl rollout status deployment/inference-service -n $NAMESPACE --timeout=120s

# 5. API Gateway
echo "[5/8] Deploying API Gateway..."
kubectl apply -f k8s/api-gateway/deployment.yaml
kubectl apply -f k8s/api-gateway/service.yaml
kubectl apply -f k8s/api-gateway/hpa.yaml
kubectl rollout status deployment/api-gateway -n $NAMESPACE --timeout=180s

# 6. Frontend
echo "[6/8] Deploying Frontend..."
kubectl apply -f k8s/frontend/deployment.yaml
kubectl apply -f k8s/frontend/service.yaml
kubectl rollout status deployment/frontend -n $NAMESPACE --timeout=60s

# 7. Monitoring (Prometheus + Grafana)
echo "[7/8] Deploying Monitoring stack..."
kubectl apply -f k8s/monitoring/prometheus/configmap.yaml
kubectl apply -f k8s/monitoring/prometheus/deployment.yaml
kubectl apply -f k8s/monitoring/prometheus/service.yaml
kubectl apply -f k8s/monitoring/grafana/deployment.yaml
kubectl apply -f k8s/monitoring/grafana/service.yaml

# 8. Ingress
echo "[8/8] Applying Ingress rules..."
kubectl apply -f k8s/ingress.yaml

echo ""
echo "=== Deployment complete! ==="
echo ""
echo "Pod status:"
kubectl get pods -n $NAMESPACE
echo ""
echo "Services:"
kubectl get svc -n $NAMESPACE
echo ""
echo "HPAs:"
kubectl get hpa -n $NAMESPACE
echo ""
echo "Access URLs (add to /etc/hosts: <INGRESS_IP> capstone.local api.capstone.local grafana.capstone.local):"
echo "  Frontend:   http://capstone.local"
echo "  API:        http://api.capstone.local/api/v1/auth/login"
echo "  Grafana:    http://grafana.capstone.local  (admin / admin123)"
echo "  Prometheus: http://prometheus.capstone.local"
