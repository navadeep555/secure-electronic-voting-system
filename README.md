# Secure Electronic Voting System

[![Docker Builds](https://img.shields.io/badge/docker-passing-success.svg)](#) [![Version](https://img.shields.io/badge/version-v1.0.0-blue.svg)](#) [![Node](https://img.shields.io/badge/node-v20.x-green.svg)](#) [![Python](https://img.shields.io/badge/python-3.11+-yellow.svg)](#) [![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](#) [![CII Best Practices](https://bestpractices.dev/projects/684/badge)](#)

A high-assurance, cryptographically secure full-stack biometric electronic voting platform. Engineered to guarantee cryptographic ballot integrity, strict Role-Based Access Controls (RBAC), and immutable audit trails, this system acts as a modernized digital ledger for democratic processes.

---

## Table of Contents

- [About](#about)
- [Live Deployments](#live-deployments)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [System Requirements](#system-requirements)
- [Installation Guide](#installation-guide)
  - [Method 1: Docker Orchestration (Recommended)](#method-1-docker-orchestration-recommended)
  - [Method 2: Local Bare Metal (Linux / macOS)](#method-2-local-bare-metal-linux--macos)
  - [Method 3: Local Bare Metal (Windows)](#method-3-local-bare-metal-windows)
- [Configuration & Environment Variables](#configuration--environment-variables)
- [Usage Guide](#usage-guide)
  - [Voter Interface](#voter-interface)
  - [Administrator Dashboard](#administrator-dashboard)
- [Cryptographic Security](#cryptographic-security)
- [Documentation & API Reference](#documentation--api-reference)
- [Troubleshooting & FAQ](#troubleshooting--faq)
  - [SSL Certificate Errors](#ssl-certificate-errors)
  - [Webcam Biometric Failures](#webcam-biometric-failures)
  - [Docker Memory Constraints](#docker-memory-constraints)
- [Contributing](#contributing)
- [License](#license)

---

## About

The **Secure Electronic Voting System** mitigates traditional vulnerabilities associated with online voting through a multi-layered security architecture:
1. **Identity Verification:** Utilizes real-time facial recognition (`dlib`) and Aadhar/SSN biometric hashing to accurately authenticate voters.
2. **Ledger Immutability:** Votes are cryptographically hashed using `HMAC-SHA256` payload verification against a relational PostgreSQL database.
3. **Microservice Isolation:** High-throughput ledger mathematics are separated into a Node.js container, while administration and Machine Learning inference are separated into a Python Flask container.

---

## Live Deployments

The following Edge deployments are actively running the latest `main` branch code, configured via Render Web Services and Vercel.

- 🌍 **Voter Interface & Admin Dashboard (Vercel)**: [https://secure-electronic-voting-system.vercel.app/](https://secure-electronic-voting-system.vercel.app/)
- 🟩 **Voting Core Application Programming Interface (Node.js/Render)**: [https://voting-core.onrender.com/](https://voting-core.onrender.com/)
- 🐍 **Admin & Authentication API (Flask/Render)**: [https://flask-backend-wm4y.onrender.com/](https://flask-backend-wm4y.onrender.com/)

---

## Architecture & Tech Stack

The workspace relies on a monolithic repository controlling three isolated contexts. 

| Service | Technology Base | Internal Port | External Proxy | Primary Responsibility |
|---|---|---|---|---|
| **Voter UI** | React, Vite, TS, Tailwind | 80 | `https://localhost` | SPA for Voters and Admins |
| **Flask API** | Python 3.11, Flask, dlib | 5000 | `https://localhost/api/` | Biometrics, ML, Admin RBAC |
| **Voting Core** | Node.js, Express, TS | 5002 | `https://localhost/voting/` | HMAC Signatures, Block Hashes |
| **API Gateway**| Nginx 1.25 | 80/443 | `:80` → `:443` | Reverse Proxy, SSL Termination |
| **Database** | PostgreSQL 16 | 5432 | `localhost:5433` | Relational Storage & Auditing |

---

## System Requirements

To run the orchestration layers natively or via Docker, your system **must** meet the minimum configurations:
- **CPU:** 4+ Cores (Required for `dlib` facial mapping ML models).
- **RAM:** Minimum 8GB (Docker must be allocated ≥ 4GB to prevent OOM termination).
- **OS:** Windows 10/11 (WSL2), macOS (M1/Intel), or Ubuntu 22.04 LTS.
- **Dependencies:** Docker Desktop v24+, OpenSSL (for local CA certs).

---

## Installation Guide

### Method 1: Docker Orchestration (Recommended)

Docker Compose offers the only deterministic, production-parity installation method.

1. **Clone the Source Code:**
   ```bash
   git clone https://github.com/navadeep555/secure-electronic-voting-system.git
   cd secure-electronic-voting-system
   ```

2. **Generate Self-Signed TLS Certificates:**
   Because biometric mapping requires browsers to access WebRTC camera protocols, the application **must** be served over HTTPS. We provide automation scripts to generate localized CA certs.
   
   *On Linux / macOS (Bash):*
   ```bash
   bash devops/ssl/gen-certs.sh
   ```
   *On Windows (PowerShell):*
   ```powershell
   .\devops\ssl\gen-certs.ps1
   ```

3. **Hydrate Environment Variables:**
   ```bash
   cp .env.example .env
   # Modify .env to include strong cryptographic passwords
   ```

4. **Initialize Containers:**
   Execute compilation. Due to C++ bindings inside `dlib` and NumPy, the initial image compilation will require **5 to 15 minutes**.
   ```bash
   docker compose up --build -d
   ```

### Method 2: Local Bare Metal (Linux / macOS)

If you must bypass Docker to debug native components:

**1. Database Initialization:**
```bash
sudo -u postgres psql -c "CREATE USER voting WITH PASSWORD 'voting123';"
sudo -u postgres psql -c "CREATE DATABASE votingdb OWNER voting;"
```

**2. Node.js Voting Core:**
```bash
cd voting-core
npm install
npm run dev # Mounts to localhost:5002
```

**3. Python Flask Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py # Mounts to localhost:5001
```

**4. React Frontend:**
```bash
npm install
npm run dev # Mounts to localhost:8080
```

### Method 3: Local Bare Metal (Windows)
Follow Method 2, but activate the Python virtual environment utilizing:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

---

## Configuration & Environment Variables

The system relies strictly on immutable `.env` injections.

| Variable Name | Purpose | Example Value | Target Container |
|---|---|---|---|
| `JWT_SECRET` | 64-character signing string for session tokens | `a5f4...9be` | Node + Flask |
| `DB_INTEGRITY_KEY` | Salt used to compute `HMAC-SHA256` payload hashes | `b41v...8z2` | Node + Flask |
| `DATABASE_URL` | SQLAlchemy/TypeORM postgres connection string | `postgresql://...`| Node + Flask |
| `VITE_API_URL` | Overrides relative Nginx proxy paths (Production only) | `https://api.com`| Frontend |

---

## Usage Guide

### Voter Interface
1. Load `https://localhost` within your browser. 
   *(Note: Bypass the "Connection not Private" warning triggered by the self-signed SSL cert).*
2. Navigate to the **Voter Login** portal.
3. Authenticate utilizing an Aadhar ID mapped with your live WebRTC camera feed.
4. Active `Elections` mathematically available to your demographic will appear.

### Administrator Dashboard
1. Load `https://localhost/admin`.
2. Login utilizing SuperAdmin credentials defined during database seeding.
3. **Features:**
   - Provision `DRAFT` elections.
   - Authorize Candidates to ballots.
   - Mutate election lifecycles (`ACTIVE`, `PAUSED`, `CLOSED`).
   - Audit the real-time Security Log for duplicate-vote TAMPER warnings.

---

## Cryptographic Security

The architecture is fortified against Deepfakes, SQL Injections, and DB Tampering.

- **Immutability Signatures:** When a vote payload reaches `/api/voter/cast-vote`, it is signed against `DB_INTEGRITY_KEY`. If an attacker breaches the PostgreSQL database and alters a row (e.g. `UPDATE votes SET candidate_id=...`), the `integrity_signature` is invalidated, and the public tally engine will reject the block.
- **TLS 1.3 / HSTS:** All unencrypted port `80` requests are aggressively rewritten to port `443`.
- **RBAC (Role-Based Access Control):** The Python wrappers physically reject `voter` scoped tokens attempting to access `admin` routes, enforcing strict JWT claims validation.
- **Data At Rest:** Cryptographic salts (bcrypt) restrict mapping PII to the explicit hash variants.

---

## Documentation & API Reference

All comprehensive strategies, CI/CD pipeline architectural documents, and REST API payload definitions are maintained inside the `/docs` directory.

* [API Documentation Reference](./docs/API_DOCUMENTATION.md)
* [Backend Render Deployment Guide](./docs/BACKEND_DEPLOYMENT_RENDER.md)
* [Frontend Vercel Deployment Guide](./docs/FRONTEND_DEPLOYMENT_VERCEL.md)
* [GitHub Actions CI/CD Pipeline Protocol](./docs/CI_CD_PIPELINE.md)
* [Initial DevOps & Scaling Strategy](./docs/DevOpsStrategy.md)
* [Unit Testing Architecture](./docs/TESTING_STRATEGY.md)

---

## Troubleshooting & FAQ

### SSL Certificate Errors
Browsers universally reject self-signed root certificate authorities (CA). 
- **Chrome/Edge:** Click `Advanced` -> `Proceed to localhost (unsafe)`.
- **Safari:** Click `Show Details` -> `visit this website`.

### Webcam Biometric Failures
If the UI logs `NotReadableError` or the camera fails to bind:
1. Ensure no other application (Zoom, Teams, OBS) currently claims the active video stream.
2. Ensure you are accessing the site via `https://` (WebRTC fails silently on `http://`).

### Docker Memory Constraints
If the `voting-flask-api` crashes during `npm run` or while compiling `dlib`:
- Open Docker Desktop.
- Navigate to **Settings > Resources > Advanced**.
- Increase the Memory allocation to `>= 4.00 GB` and restart the daemon.

---

## Contributing

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingSecurityPatch`).
3. Commit your Changes (`git commit -m 'Added enhanced zero-knowledge proof'`).
4. Ensure the `.github/workflows/ci.yml` pipeline successfully compiles.
5. Push to the Branch (`git push origin feature/AmazingSecurityPatch`).
6. Open a Pull Request toward `main`.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

*This project was engineered to satisfy strict security requirements regarding immutable electronic voting architectures.*
