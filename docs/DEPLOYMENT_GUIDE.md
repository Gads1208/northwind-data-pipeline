# 🚀 Complete Deployment & Execution Guide

Follow this guide to execute the full application stack on a clean Linux or macOS machine with Docker installed.

---

## 📋 Prerequisites

- Docker (v20.10+) & Docker Compose (v2.0+)
- Python 3.11+ (Optional, for running tests locally)
- Node.js 20+ (Optional, for frontend development)

---

## ⚡ Quick Start (Docker Compose)

### 1. Clone Repository & Navigate
```bash
git clone https://github.com/Gads1208/northwind-data-pipeline.git
cd northwind-data-pipeline
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Build & Launch Containers
Execute the Makefile command or Docker Compose directly:
```bash
make build
make up
```
Or via Docker Compose:
```bash
docker compose build
docker compose up -d
```

---

## 🌐 Access Points

| Service | Local URL | Port |
| :--- | :--- | :--- |
| **Interactive BI Dashboard** | `http://localhost` or `http://localhost:3000` | 80 / 3000 |
| **FastAPI Backend OpenAPI Specs** | `http://localhost:8000/docs` | 8000 |
| **MCP Server Tools API** | `http://localhost:8001/mcp/tools` | 8001 |
| **AI Multi-Agent Orchestrator** | `http://localhost:8002` | 8002 |
| **Prometheus Monitoring** | `http://localhost:9090` | 9090 |
| **PostgreSQL Database** | `localhost:5432` | 5432 |

---

## 🧪 Running Automated Tests

Run the test suite using pytest:
```bash
pytest tests/
```
