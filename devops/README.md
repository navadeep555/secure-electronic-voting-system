# DevOps – Secure Electronic Voting System
## EPIC 6 – US6.3: Secure Communication

> **Principle**: All changes in this folder are **additive only**. Zero lines of existing application code were modified.

---

## Architecture Overview

```
                     ┌─────────────┐
                     │   Browser   │
                     └──────┬──────┘
                            │  HTTPS :443
                            ▼
              ╔═════════════════════════════╗
              ║       Nginx Reverse Proxy   ║
              ║  ┌─────────────────────── ┐ ║
              ║  │ • TLS Termination      │ ║
              ║  │ • HTTP→HTTPS Redirect  │ ║
              ║  │ • Security Headers     │ ║
              ║  │ • Rate Limiting        │ ║
              ║  └──────────┬────────────┘ ║
              ╚════════════╪════════════════╝
                           │
              ┌────────────┼──────────────┐
              │            │              │
         /api/*      /voting-core/*      /
              │            │              │
              ▼            ▼              ▼
      ┌──────────┐  ┌──────────┐  ┌──────────┐
      │  Flask   │  │ Node.js  │  │ React    │
      │ Backend  │  │ Voting   │  │ SPA      │
      │ :5000    │  │ Core     │  │ (static) │
      │ (Python) │  │ :3001    │  └──────────┘
      └──────────┘  └──────────┘

  All services run inside a private Docker network (voting-net).
  Only Nginx is exposed on ports 80/443 to the host.
```

### Network Port Summary

| Service | Container Port | Public Access |
|---------|---------------|---------------|
| Nginx | 80, 443 | ✅ Yes (host) |
| Flask backend | 5000 | ❌ Internal only |
| voting-core | 3001 | ❌ Internal only |
| React SPA | 80 | ❌ Via Nginx only |

---

## Directory Structure

```
devops/
├── ssl/
│   ├── openssl.cnf          # OpenSSL certificate config (SANs)
│   ├── gen-certs.sh         # Self-signed cert generator (Linux/Mac)
│   ├── gen-certs.ps1        # Self-signed cert generator (Windows)
│   └── certs/               # ← Generated certs go here (gitignored)
│       ├── server.crt
│       ├── server.key
│       └── ca.crt
├── nginx/
│   ├── nginx.conf           # Production Nginx (HTTPS + security headers)
│   ├── nginx-dev.conf       # Development Nginx (HTTP only)
│   └── spa.conf             # React SPA routing config (try_files)
├── scripts/
│   ├── deploy.sh            # Full deployment script
│   └── check-cert-expiry.sh # Certificate expiry monitor
└── config/
    └── letsencrypt.ini      # Let's Encrypt / Certbot config template

Dockerfile                   # Flask Python backend
docker-compose.yml           # Full stack orchestration
.env.example                 # Environment variable template
frontend/Dockerfile          # React SPA (Vite build → nginx)
voting-core/Dockerfile       # Node.js voting-core backend
.github/workflows/deploy.yml # GitHub Actions CI/CD pipeline
```

---

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) or Docker + Docker Compose (Linux)
- OpenSSL (for generating self-signed certs)

### Step 1 – Configure environment

```bash
# Copy the environment template
cp .env.example .env

# Edit with real secrets
notepad .env          # Windows
nano .env             # Linux/Mac
```

> ⚠️ **Never commit `.env` to version control.** It is already in `.gitignore`.

### Step 2 – Generate TLS Certificates

**Linux / Mac:**
```bash
bash devops/ssl/gen-certs.sh
```

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File devops\ssl\gen-certs.ps1
```

**Manual OpenSSL commands:**
```bash
# 1. Create certs directory
mkdir -p devops/ssl/certs

# 2. Generate CA key + cert
openssl genrsa -out devops/ssl/certs/ca.key 4096
openssl req -new -x509 -days 365 \
  -key devops/ssl/certs/ca.key \
  -out devops/ssl/certs/ca.crt \
  -subj "/C=IN/ST=Telangana/O=Voting System CA/CN=VotingCA"

# 3. Generate server key + CSR
openssl genrsa -out devops/ssl/certs/server.key 2048
openssl req -new \
  -key devops/ssl/certs/server.key \
  -out devops/ssl/certs/server.csr \
  -config devops/ssl/openssl.cnf

# 4. Sign server cert with CA
openssl x509 -req \
  -in devops/ssl/certs/server.csr \
  -CA devops/ssl/certs/ca.crt \
  -CAkey devops/ssl/certs/ca.key \
  -CAcreateserial \
  -out devops/ssl/certs/server.crt \
  -days 365 -sha256 \
  -extensions v3_req \
  -extfile devops/ssl/openssl.cnf
```

### Step 3 – Deploy

```bash
# Full deployment (HTTPS):
bash devops/scripts/deploy.sh

# Or manually:
docker compose up --build -d
```

### Step 4 – Verify

```bash
# Check HTTP redirects to HTTPS (expect 301)
curl -I http://localhost

# Access API over HTTPS (use -k for self-signed cert)
curl -k https://localhost/api/elections

# Check security headers
curl -kI https://localhost | grep -E "Strict-Transport|X-Frame|X-Content|Content-Security"

# View running containers
docker compose ps

# View logs
docker compose logs -f nginx
docker compose logs -f flask-backend
```

---

## HTTPS Enforcement

All HTTP (`port 80`) requests receive a **301 Permanent Redirect** to HTTPS:

```nginx
# nginx.conf – Server block 1 (port 80)
server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

This ensures **100% of traffic is encrypted** using TLS 1.2/1.3 before reaching the application.

---

## Security Headers

The following headers are added by Nginx to **every response**:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Force HTTPS for 1 year |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS protection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | `geolocation=(), camera=(self)` | Restrict browser APIs |
| `Content-Security-Policy` | `default-src 'self'; ...` | Prevent XSS/injection |

> **Note**: `camera=(self)` is explicitly allowed in CSP and Permissions-Policy because the voting system uses webcam-based face recognition.

---

## TLS Configuration

| Setting | Value |
|---------|-------|
| Protocols | TLS 1.2, TLS 1.3 only |
| Ciphers | ECDHE-RSA/ECDSA-AES256-GCM, CHACHA20-POLY1305 |
| HSTS | Enabled (1 year, includeSubDomains) |
| OCSP Stapling | Enabled |
| Session Cache | 10MB shared (10 min timeout) |

---

## Production: Let's Encrypt Certificates

For a real domain, replace self-signed certs with free Let's Encrypt certificates:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain cert for your domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com \
  --email admin@yourdomain.com --agree-tos --non-interactive

# Auto-renewal (add to crontab)
echo "0 3 * * * certbot renew --quiet --post-hook 'docker compose restart nginx'" | crontab -
```

See `devops/config/letsencrypt.ini` for the full configuration template.

---

## Certificate Monitoring

Check when the TLS certificate expires:

```bash
# Manual check
bash devops/scripts/check-cert-expiry.sh

# Add to crontab (daily check at 9am)
echo "0 9 * * * bash /path/to/devops/scripts/check-cert-expiry.sh" | crontab -
```

**Exit codes:**
- `0` = Certificate valid (> 30 days remaining)
- `1` = Warning (< 30 days) or Critical (< 7 days) or Expired

### Monitor Nginx Logs

```bash
# Watch all access logs (see HTTPS vs HTTP in scheme= field)
docker compose exec nginx tail -f /var/log/nginx/access.log

# Watch HTTP-only access (insecure access detection)
docker compose exec nginx tail -f /var/log/nginx/http_access.log

# Watch error log
docker compose exec nginx tail -f /var/log/nginx/error.log

# Filter bot/scan traffic
docker compose exec nginx grep -i "404\|403" /var/log/nginx/access.log
```

Log format includes: `scheme=https ssl_protocol=TLSv1.3 ssl_cipher=...` for every request.

---

## CI/CD Pipeline

`.github/workflows/deploy.yml` automates the following on every push to `main`:

```
Push to main
    │
    ├─ [Job 1] test
    │   ├── Python 3.11 tests (pytest)
    │   ├── TypeScript type-check (voting-core)
    │   └── React production build (npm run build)
    │
    ├─ [Job 2] build-and-push  (only on merged to main)
    │   ├── Validate Nginx config (nginx -t)
    │   ├── Build & push Flask image → ghcr.io
    │   ├── Build & push voting-core image → ghcr.io
    │   └── Build & push frontend image → ghcr.io
    │
    ├─ [Job 3] deploy  (only on merged to main)
    │   └── SSH into server → git pull → docker compose up -d
    │
    └─ [Job 4] verify-https
        ├── HTTP → HTTPS redirect check (expect 301)
        ├── HTTPS API health check (/api/elections → 200)
        └── Security headers verification
```

### Required GitHub Secrets

Set these in **GitHub → Repository → Settings → Secrets → Actions**:

| Secret | Description |
|--------|-------------|
| `SSH_HOST` | Production server IP or hostname |
| `SSH_USERNAME` | SSH user on production server |
| `SSH_PRIVATE_KEY` | Private key for SSH access |
| `SSH_PORT` | SSH port (default: 22) |
| `PRODUCTION_DOMAIN` | Your domain (e.g., `voting.example.com`) |

---

## Stopping Services

```bash
# Stop all containers
docker compose down

# Stop and remove volumes (CAUTION: deletes DB data)
docker compose down -v

# View resource usage
docker stats
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `curl: (60) SSL certificate problem` | Use `-k` flag for self-signed certs in dev |
| Nginx fails to start | Check cert paths: `devops/ssl/certs/server.crt` must exist |
| Flask container crashes | Run `docker compose logs flask-backend` |
| API returns 502 Bad Gateway | Flask not healthy yet — wait 40s for face recognition init |
| HTTP not redirecting | Check port 80 isn't used by another service |
