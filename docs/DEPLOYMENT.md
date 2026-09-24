# Learn-Lynx v2 — Production Deployment & Environment Setup Guide

---

## 1. Environment Variables Configuration

Create a `.env` file in the root directory:

```env
# Application Settings
ENVIRONMENT=production
DEBUG=false
PROJECT_NAME="Learn-Lynx GenAI Study Assistant"
API_V1_STR="/api/v1"

# Database Connection (SQLite default, PostgreSQL in production)
DATABASE_URL=sqlite:///./learnlynx.db
# DATABASE_URL=postgresql://user:password@localhost:5432/learnlynx_db

# JWT Authentication
JWT_SECRET_KEY=generate_a_secure_random_64_char_hex_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS Allowed Origins (Comma-separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://yourdomain.com

# AI API Keys & Models
GEMINI_API_KEY=your_gemini_api_key_here
EMBEDDING_MODEL=text-embedding-004
RERANKER_MODEL=BAAI/bge-reranker-large
CHROMA_PERSIST_DIRECTORY=./data/chroma_db

# Logging
LOG_LEVEL=INFO
```

---

## 2. Docker & Containerized Deployment

### A. Dockerfile (Backend)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend codebase
COPY backend/ ./backend/
COPY data/ ./data/

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

---

### B. Dockerfile (Frontend)
```dockerfile
FROM node:20-alpine AS build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ ./
RUN npm run build

# Production Nginx Server
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### C. Docker Compose (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    env_file:
      - .env
    volumes:
      - ./data:/app/data
      - ./learnlynx.db:/app/learnlynx.db
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

To run with Docker Compose:
```bash
docker compose up -d --build
```

---

## 3. Production Deployment Checklist
1. **Secrets**: Ensure `JWT_SECRET_KEY` and `GEMINI_API_KEY` are kept in secrets manager (e.g. AWS Secrets Manager, Doppler, GitHub Secrets).
2. **Reverse Proxy (Nginx)**: Configure SSL certificates via Let's Encrypt / Certbot.
3. **Database Backups**: Schedule regular backups of SQLite / PostgreSQL databases.
4. **Health Checks**: Monitor `/health` endpoint with UptimeRobot / Datadog.
5. **CORS Restrictions**: Lock down `CORS_ORIGINS` strictly to your production domains.
