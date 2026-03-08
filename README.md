# 🗳️ SecureVote — Secure Electronic Voting System

A secure, full-stack biometric voting platform built with React, Flask, and Node.js (Express), orchestrated via Docker Compose and served securely over HTTPS through Nginx.

---

## 🏗️ Architecture Overview

| Service | Technology | Internal Port | External Port |
|---|---|---|---|
| **UI (Frontend)** | React + Vite + TypeScript | 80 | `https://localhost` |
| **Flask API** (Face recognition, OTP, Auth) | Python 3.11 + Flask | 5000 | `https://localhost/api/` |
| **Voting Core API** (Elections, Votes, Admin) | Node.js + Express + TypeScript | 5002 | `https://localhost/voting/` |
| **Nginx** (Reverse Proxy + SSL) | Nginx 1.25 | 80 / 443 | `:80` → `:443` |
| **PostgreSQL** (Database) | Postgres 16 | 5432 | `localhost:5433` |

---

## 📋 Prerequisites

Before you begin, ensure the following tools are installed:

| Tool | Minimum Version | Download |
|---|---|---|
| **Docker Desktop** | 24+ | https://www.docker.com/products/docker-desktop |
| **Docker Compose** | v2 (bundled with Docker Desktop) | — |
| **OpenSSL** | Any | https://slproweb.com/products/Win32OpenSSL.html (Windows) |
| **PowerShell** | 5.1+ | Pre-installed on Windows 10/11 |
| **Git** | Any | https://git-scm.com |
| Node.js *(only for local dev)* | 18+ | https://nodejs.org |
| Python *(only for local dev)* | 3.11+ | https://www.python.org |

---

## 🚀 Running with Docker (Recommended)

### Step 1 — Clone the Repository
```bash
git clone https://github.com/navadeep555/secure-electronic-voting-system.git
cd secure-electronic-voting-system
```

### Step 2 — Generate SSL Certificates
Self-signed HTTPS certificates are required for the Nginx proxy.

**On Windows (PowerShell):**
```powershell
.\devops\ssl\gen-certs.ps1
```

**On Linux / macOS (Bash):**
```bash
bash devops/ssl/gen-certs.sh
```

This generates `server.crt` and `server.key` inside `devops/ssl/certs/`.

### Step 3 — Configure Environment Variables
Copy the example env file and fill in your secrets:
```bash
cp .env.example .env
```
Key variables:
```env
JWT_SECRET=your_shared_secret
DB_PASSWORD=voting123
ENCRYPTION_KEY=a_long_secret_key_for_aes
```

### Step 4 — Build and Start All Services
```bash
docker compose up --build -d
```
> ⚠️ **First build takes 5–15 minutes** as it downloads Python ML libraries (`dlib`, `face_recognition`, etc.) and Node.js dependencies.

### Step 5 — Access the Application

| Service | URL |
|---|---|
| 🖥️ **Voting UI** | https://localhost |
| 🐍 **Flask API (Health Check)** | https://localhost/api/health |
| 🟩 **Voting Core API (Health Check)** | https://localhost/voting/health |
| 🗄️ **PostgreSQL** *(direct)* | `localhost:5433` |

> 🔒 Your browser will show a **"Your connection is not private"** warning because we use **self-signed certificates** for local development. Click **Advanced → Proceed to localhost (unsafe)** to continue.

### Stopping the Application
```bash
docker compose down
```

### Viewing Logs
```bash
# All services
docker compose logs -f

# Flask backend only (useful for OTP debugging)
docker logs voting-flask-api -f

# Voting Core API
docker logs voting-core-api -f
```

---

## 🛠️ Local Development (Without Docker)

### Frontend
```bash
npm install
npm run dev
```
→ Runs at `http://localhost:8080`

### Flask Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Linux/macOS
pip install -r requirements.txt
python app.py
```
→ Runs at `http://localhost:5001`

### Voting Core (Express)
```bash
cd voting-core
npm install
npm run dev
```
→ Runs at `http://localhost:5002`

### Local Database
Make sure PostgreSQL is running and create the `votingdb` database:
```bash
psql -U postgres -c "CREATE USER voting WITH PASSWORD 'voting123';"
psql -U postgres -c "CREATE DATABASE votingdb OWNER voting;"
```

---

## 🔐 Security Features (US6.3)

- **HTTPS Enforced**: All traffic is encrypted via TLS 1.2/1.3 (self-signed certs for dev, Let's Encrypt for production).
- **HTTP → HTTPS Redirect**: Port 80 automatically redirects to 443.
- **HSTS**: Strict-Transport-Security header prevents downgrade attacks.
- **Security Headers**: `helmet` (Express) and `Flask-Talisman` (Flask) add XSS/clickjacking protection.
- **Rate Limiting**: 100 req/15 min globally; 5 req/min on biometric auth endpoints.
- **PII Hashing**: User IDs and phone numbers are SHA-256 hashed before storage.

---

## 🗂️ Project Structure

```
secure-electronic-voting-system/
├── src/                    # React Frontend (TypeScript/Vite)
├── backend/                # Flask API (Python)
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
├── voting-core/            # Express API (Node.js/TypeScript)
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── devops/
│   ├── nginx/nginx.conf    # Nginx reverse proxy + SSL config
│   └── ssl/               # Certificate generation scripts
├── docker-compose.yml      # Full stack orchestration
└── .env                    # Environment variables
```

---

## 💡 Troubleshooting

| Problem | Solution |
|---|---|
| `ERR_CERT_AUTHORITY_INVALID` in browser | Click **Advanced → Proceed to localhost** |
| Camera `NotReadableError` | Close other apps using the webcam, then refresh |
| CORS error on API call | Ensure you access the app via `https://localhost`, not `:8080` |
| OTP not received | Run `docker logs voting-flask-api \| Select-String "OTP"` |
| Build fails on `dlib` | Ensure Docker has at least 4GB RAM allocated in Docker Desktop settings |
