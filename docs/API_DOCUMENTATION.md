# 🌐 Secure Electronic Voting System - API Architecture

## 📌 Executive Overview
This document serves as the authoritative interface contract for the **Secure Electronic Voting System**. The architecture implements a strict separation of concerns utilizing two robust backend services:
1. **Flask Backend:** Handles Role-Based Access Control (RBAC), UI routing, and Admin lifecycle management.
2. **Voting Core (Node.js):** Mathematically isolated ledger container handling cryptographic nonce generation and high-throughput vote registration.

All endpoints adhere strictly to RESTful principles and return normalized JSON payloads.

---

## 🔒 Authentication & Integrity (`/api/auth`)

All secured endpoints utilize **JWT (JSON Web Tokens)** passed via the strictly enforced `Authorization: Bearer <token>` header.

| Method | Endpoint | Description | Request Payload | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/admin/login` | Authenticates System Administrators | `{ username, password }` | No |
| `POST` | `/voter/login` | Authenticates Voters via Biometrics/Aadhaar | `{ voterId, faceHash }` | No |
| `GET` | `/voter/verify` | Validates session token integrity | None | Yes |

---

## 🏛️ Election Lifecycle Administration (`/api/admin`)

Strictly restricted to users possessing the `admin` or `super_admin` JWT scopes. Handles ledger initialization.

| Method | Endpoint | Description | Request Payload | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/admin/setup-election` | Initializes a new `DRAFT` ledger | `{ title, description, start_time, end_time }` | Yes (Admin) |
| `PATCH` | `/admin/election-status`| Mutates lifecycle (`DRAFT` → `ACTIVE`) | `{ electionId, status }` | Yes (Admin) |
| `DELETE`| `/admin/elections/:eid` | Purges `DRAFT` elections. Prevents purging `ACTIVE` ledgers for audit trails. | None | Yes (Admin) |
| `POST` | `/admin/add-candidate` | Injects a valid Candidate into a `DRAFT` election ledger | `{ electionId, name, party }` | Yes (Admin) |
| `POST` | `/admin/register-voters` | Registers array of cryptographic Voter Hashes (US3.4) | `{ electionId, voterHashes[] }` | Yes (Admin) |
| `GET` | `/admin/elections` | Returns all internal elections and their granular metadata | None | Yes (Admin) |

---

## 🗳️ Cryptographic Voting Core (`/api/voter`)

The highly-secured execution environment. Exposed specifically to users possessing the `voter` JWT scope.

| Method | Endpoint | Description | Request Payload | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/voter/cast-vote` | Submits vote. Generates `HMAC-SHA256` signature & Blockchain Nonce | `{ election_id, candidate_id, pin }` | Yes (Voter) |
| `GET` | `/voter/elections` | Fetches active elections the authenticated voter is eligible for | None | Yes (Voter) |
| `GET` | `/voter/elections/:eid/candidates`| Fetches the active candidates on an eligible ballot | None | Yes (Voter) |

> [!IMPORTANT]
> The `/cast-vote` endpoint enforces strict idempotency logic. If a `voterId` attempts to submit multiple distinct ballots against the same `election_id`, the system will generate a `403 FORBIDDEN` and log a `DUPLICATE_VOTE_ATTEMPT` to the Audit Trail.

---

## 👁️ Observers & Public Transparency (`/api/public` & `/api/observer`)

Read-only endpoints that do not require an `Authorization` header. Designed to supply cryptographic proof to independent auditors and citizen watchdogs.

| Method | Endpoint | Description | Query Params | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/public/elections` | Returns global metadata for upcoming/active elections | None | No |
| `GET` | `/observer/results/:eid`| Triggers ledger decryption and tallying | None | No |
| `GET` | `/observer/verify-receipt`| Validates a voter's `receipt_hash` against the `block_hash` | `?receiptHash=` | No |
| `GET` | `/public/audit-log` | Returns the immutable tampering alert history | `?limit=100` | No |

> [!WARNING]
> The `/observer/results/:eid` endpoint will intentionally respond with `403 FORBIDDEN` if the requested election ledger has not been manually certified and closed by an Administrator. This prevents anonymity stripping via live-metrics observation.

---

## 🚦 System Health & Metrics (`/api/health`)

| Method | Endpoint | Description | Expected Response | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Server heartbeat and DB Connection verification | `{ "status": "UP", "db": "CONNECTED" }` | No |
| `GET` | `/admin/stats` | Global system execution metrics | JSON map of total votes, candidates, alerts | Yes (Admin) |
| `GET` | `/security-status`| Global threat-intelligence snapshot | `{ "threat_level": "low" \| "high" }` | No |
