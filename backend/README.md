# Secure Electronic Voting System - Backend

This is the core backend for the Secure Electronic Voting System. It provides biometric facial recognition, secure OTP-based authentication, integrated security monitoring, and robust data recovery mechanisms.

## 🚀 System Architecture

- **Web Framework**: Flask (Python 3.11)
- **Biometric Engine**: `Face Recognition` (dlib-based)
- **Primary Database**: PostgreSQL (Hosted on Render)
- **Face Encoding Storage**: Serialized vector storage (`face_encodings.pkl`)
- **Deployment**: Dockerized services for consistent environments.

## ✨ Features

- **✅ Biometric Lifecycle**: Secure registration (4 stages) and authentication.
- **✅ Hybrid Data Storage**: Relational data in PostgreSQL; biometric vectors in optimized files.
- **✅ Security Monitoring (US6.4)**: Real-time detection of brute-force and anomalies.
- **✅ Backup & Recovery (US6.5)**: Automated and manual SQL-based snapshots.
- **✅ Secure Transmission (US6.3)**: Enforced TLS/SSL across all cloud endpoints.

---

## 🛠️ Setup & Installation

The recommended way to run the backend is using **Docker Compose**.

### Prerequisites
- Docker & Docker Desktop (for Windows)
- `.env` file with Render PostgreSQL connection string

### Running with Docker (Recommended)
```bash
# 1. Build the images
docker-compose build flask-backend

# 2. Start the services
docker-compose up -d
```

### Manual Setup (Development)
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

---

## 🔐 API Documentation

### 1. Registration & Authentication

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/register-face` | Register user with 4 face images |
| POST | `/api/recognize-face` | Verify face biometric identity |
| POST | `/api/verify-otp` | Verify 2FA/OTP code (Requires token) |

### 2. Admin & System

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Check backend & DB status |
| POST | `/api/admin/backup` | Trigger manual DB snapshot (Header token required) |
| GET | `/api/users` | List registered voter handles |

---

## 🛡️ Security Implementation (US 6.4)

The system automatically monitors for security-relevant events:
- **Brute Force Detection**: Monitoring of repeated failed authentication attempts.
- **Access Violation Alerts**: Real-time logging of unauthorized API access attempts.
- **Anomaly Detection**: Logging of suspicious activity patterns in `system_logs`.

To view security alerts:
```sql
SELECT * FROM system_logs WHERE log_level = 'CRITICAL';
```

---

## 💾 Backup & Recovery (US 6.5)

### Manual Backup via API
Ensure you include your admin JWT token in the header:
```bash
curl -X POST http://localhost:5000/api/admin/backup \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Manual Backup via Container
You can bypass the API and run a direct dump from inside the container:
```bash
docker exec -it voting-flask-api bash /app/backup_database.sh
```

### Restoration
To restore a specific snapshot to the Render database:
```bash
docker exec -it voting-flask-api bash /app/restore_database.sh /app/backups/YOUR_FILE.sql
```

---

## 📁 File Structure

```
backend/
├── app.py                 # Core API & Routing
├── auth.py                # Security & JWT logic
├── security_monitor.py    # US 6.4 Monitoring logic
├── Dockerfile             # Production container config
├── encodings/             # Face vector storage
├── backups/               # Database snapshots
└── logs/                  # Application runtime logs
```

## ⚖️ License
This system is part of the Secure Electronic Voting System project. Unauthorized reproduction is strictly prohibited.
