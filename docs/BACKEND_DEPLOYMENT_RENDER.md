# 🚢 Backend Deployment Guide - Render

## 📌 Overview

This guide details the procedure for deploying both backend microservices of the **Secure Electronic Voting System** to Render. The backend architecture consists of:
1. **Flask Admin API (Python)**: Handles RBAC, election lifecycles, and ORM.
2. **Voting Core API (Node.js)**: Handles cryptographic vote processing, digital signatures, and blockchain nonces.

---

## 📋 Prerequisites

1. **Render Account**: Active account at [render.com](https://dashboard.render.com).
2. **GitHub Repository**: Continuous Integration synced repository.
3. **Managed PostgreSQL**: A cloud-hosted PostgreSQL database (Render managed DB is required).

---

## 🛠️ Step 1: Prepare Your Infrastructure

### 1.1 `render.yaml` Configuration (Blueprint)

A `render.yaml` file exists in the project root to automate the provisioning of both services simultaneously as web services.

```yaml
services:
  # 1. Python Flask Admin API
  - type: web
    name: voting-flask-api
    env: python
    buildCommand: "cd backend && pip install -r requirements.txt"
    startCommand: "cd backend && gunicorn -w 4 -b 0.0.0.0:$PORT app:app"
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: votingdb
          property: connectionString
      - key: JWT_SECRET
        sync: false
      - key: DB_INTEGRITY_KEY
        sync: false

  # 2. Node.js Voting Core API
  - type: web
    name: voting-core-api
    env: node
    buildCommand: "cd voting-core && npm ci && npm run build"
    startCommand: "cd voting-core && npm start"
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: votingdb
          property: connectionString
      - key: JWT_SECRET
        sync: false
      - key: DB_INTEGRITY_KEY
        sync: false
```

### 1.2 Cross-Origin Resource Sharing (CORS) Configuration

Before deployment, ensure that both backend applications accept requests from your production Vercel frontend.
- **Flask:** Adjust the `CORS(app, resources={...})` in `app.py`.
- **Voting Core:** Adjust the `cors({ origin: [...] })` in `server.ts`.

---

## 🚀 Step 2: Deploying to Render via Dashboard

### 2.1 Connect Your Repository

1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **"New +"** → **"Blueprint"** (Recommended for multi-service apps).
3. Connect your GitHub account and select your repository.

### 2.2 Configure Environment Variables

Secure cryptographic keys must be supplied manually in the Render dashboard during provisioning.

| Key | Example Value | Description | Required |
|-----|-------|-------------|----------|
| `JWT_SECRET` | `5c8b...` | A 64-character secure hexadecimal string for JWT token generation | Yes |
| `DB_INTEGRITY_KEY` | `9a1f...` | Cryptographic secret for generating HMAC-SHA256 signatures | Yes |
| `DATABASE_URL` | `postgresql://...`| Auto-linked by Blueprint, or provided manually if deploying individually | Yes |

> [!CAUTION]
> **Cryptographic Security Note:** Never commit `JWT_SECRET` or `DB_INTEGRITY_KEY` to GitHub. The integrity of the election ledger mathematically relies entirely on the secrecy of the `DB_INTEGRITY_KEY`.

---

## 🩺 Step 3: Verification & Initializing

### 3.1 Verify Deployment Logs
- Navigate to the logs for `voting-flask-api`.
- Wait for the message indicating Gunicorn workers have booted.
- Render will automatically execute the SQL schema creation definitions within `app.py` upon connecting to the database.

### 3.2 Test Production Endpoints
Verify that the services are isolated but running correctly:

```bash
# Verify Flask Heartbeat
curl https://voting-flask-api.onrender.com/api/health

# Verify Identity Provider Role Validation
curl -X POST https://voting-flask-api.onrender.com/api/admin/login
```

### 3.3 Link the Vercel Frontend
Ensure that in Vercel, your `vercel.json` rewrites are routing `/api/voter` to the Node.js Render URL, and `/api` to the Flask Render URL.

---

## 🚨 Common Issues and Solutions

### Issue 1: Node.js Cryptographic Build Fails
**Error:** V8 memory allocation failure or compilation error during `npm run build`.
**Solution:**
- Render's Free tier limits RAM to 512MB. TypeScript compilation may exceed this. Add `NODE_OPTIONS="--max-old-space-size=400"` to the Render environment variables for the Voting Core service.

### Issue 2: Flask 500 Internal Server Error (Connection Refused)
**Error:** System crashes when attempting to access `/api/public/elections`.
**Solution:**
- Ensure `DATABASE_URL` matches exactly.
- Verify that you are not using SSL enforced connections unless specified via `?sslmode=require` in the Postgres URI.

### Issue 3: Cross-Service Validation Failures
**Error:** Voting Core rejects tokens issued by Flask.
**Solution:**
- The `JWT_SECRET` string must be **perfectly identical** in the Environment Variable tabs for both `voting-flask-api` and `voting-core-api`.

---

## 📊 Performance and Scaling Considerations

### Process Management
The Flask application is configured for scalability using Gunicorn:
`gunicorn -w 4 -b 0.0.0.0:$PORT app:app`
- The `-w 4` allocates 4 synchronous workers, which is highly optimal for Render's basic tier (1 CPU, 512MB RAM).

### Sleep Mode (Free Tier)
If utilizing Render's Free tier, the web services will spin down after 15 minutes of inactivity. The next incoming request will experience a "cold boot" delay of ~30-50 seconds.
- **Production Recommendation:** Upgrade to the $7/mo Starter tier for critical election events to prevent dropping cast ballots during cold boots.

---

## 🛠️ Next Steps & Maintenance

1. **Setup Deploy Hooks:** Copy the Deploy Hook URLs from Render into GitHub Secrets to enable [CI/CD Deployments](./CI_CD_PIPELINE.md).
2. **Setup Log Streams:** Pipe Render logs to Datadog or an external syslog server for immutable audit trails.
3. **Monitor Threat Intelligence:** Monitor the `/api/security-status` endpoint for tampering alerts.
