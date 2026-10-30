# Cloud-Native AI Model Deployment Platform

Capstone Project 12 (Cloud Native Software Engineering), Department of CSE-3, KL University.

A cloud-native platform to deploy and manage machine learning models using containerised microservices.

**Live demo (frontend prototype):** https://cloud-native-ai-platform-v21.vercel.app
Demo logins: `admin` / `admin123` (full access) and `user` / `user123` (read and inference only).
The demo runs on mock data in the browser; the backend services are not deployed there.

## Team

| Name | ID |
| --- | --- |
| Vemuri Venkata Naga Sai Sri Harshad | 2300031215 |
| Pinnamaneni Rohith Venkata Sai | 2300031556 |
| Ventrapragada Jyothi Swaroop | 2300032529 |
| Mullapudi Gowtham Chowdary | 2300033079 |

Supervisor: Mr. R. Ranjith Kumar (Emp. ID 7026)

## Repository layout

| Folder | Contents |
| --- | --- |
| `frontend/` | React.js management dashboard (working prototype) |
| `backend/api-gateway/` | Spring Boot API gateway with JWT authentication and RBAC |
| `backend/model-registry/` | FastAPI model registry |
| `backend/inference-service/` | FastAPI inference service (mock model engine) |
| `k8s/` | Kubernetes manifests, including autoscalers and monitoring |
| `monitoring/` | Prometheus and Grafana configuration |
| `.github/workflows/` | CI, security scan and CD pipelines |
| `docs/` | Abstract, SRS, paper, poster, presentation and research papers |
| `docker-compose.yml` | Runs the whole stack locally |

## Run locally

Frontend only:

```bash
cd frontend
npm install
npm run dev
```

Full stack with Docker:

```bash
docker compose up --build
```

## Status

The frontend prototype, backend services, containers, Kubernetes manifests, CI/CD workflows and monitoring
configuration are in place. The inference engine, dashboard metrics and edge client are simulated, and the
platform has not yet been deployed to a live cluster or load tested.

## Documents

- Paper: [`docs/Capstone_Paper.pdf`](docs/Capstone_Paper.pdf)
- Poster: [`docs/Capstone_Poster.pdf`](docs/Capstone_Poster.pdf)
- SRS: [`docs/SRS_Cloud_Native_AI_Platform.pdf`](docs/SRS_Cloud_Native_AI_Platform.pdf)

## License

MIT, see [LICENSE](LICENSE).
