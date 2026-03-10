# Integration Testing Strategy and Test Cases
## Secure Electronic Voting System

---

## 1. Introduction
Integration Testing bridges the gap between unit testing (testing individual isolated modules) and system testing (testing the entirely integrated system). Within the **Secure Electronic Voting System**, integration testing ensures that modules such as the Frontend (React), Flask API (Biometrics/Auth), Voting Core API (Node.js/Express), and PostgreSQL Database interact seamlessly and securely.

## 2. Objectives
- **Verify Data Flow:** Ensure data is correctly passed among the UI, APIs, and the database.
- **Validate Interface Interoperability:** Ensure the React frontend correctly handles responses (both success and error states) from both the Node.js and Flask backends.
- **Ensure Security Enforcement:** Validate that token exchanges, HTTPS protocols, and authentication headers are preserved across microservices.
- **Database Consistency:** Ensure that CRUD operations initiated by APIs correctly commit, encrypt, and retrieve data from PostgreSQL.

## 3. System Components under Integration
1. **Component A:** User Interface (React + Vite + TypeScript)
2. **Component B:** Identity & Biometrics Service (Python 3.11 + Flask)
3. **Component C:** Voting Core Engine (Node.js + Express)
4. **Component D:** Relational Database (Postgres 16)
5. **Component E:** Reverse Proxy & SSL (Nginx)

---

## 4. Integration Test Suites

### Suite 1: UI to Identity Service (React ↔ Flask API)
This suite verifies that the frontend accurately sends and receives data to/from the Flask API handling face recognition and OTP handling.

| Test Case ID | Scenario Description | Input/Pre-condition | Expected Outcome | Status |
|---|---|---|---|---|
| INT-1.1 | OCR Document Verification | Upload valid national ID card image. | Flask API returns 200 OK with extracted text; UI updates state. | Pending |
| INT-1.2 | OTP Generation Request | Valid verified mobile number sent to API. | Flask API returns 200 OK, SMS/Mock OTP sent; UI shows OTP input. | Pending |
| INT-1.3 | Biometric Face Match | Base64 face image sent during login. | Flask API compares with DB encoding, returns JWT securely. | Pending |
| INT-1.4 | Rate Limit Handling (Flask) | Send 6 biometric requests in 1 minute. | Flask API returns 429 Too Many Requests; UI displays "Try again later". | Pending |

### Suite 2: UI to Voting Core Service (React ↔ Node.js API)
This suite focuses on election management, admin dashboard polling, and ballot submissions.

| Test Case ID | Scenario Description | Input/Pre-condition | Expected Outcome | Status |
|---|---|---|---|---|
| INT-2.1 | JWT Authorization on Routes | UI sends valid JWT from Flask to Node.js. | Node.js validates standard JWT, allows access to `/voting/roles`. | Pending |
| INT-2.2 | Admin Creates Election | Admin user submits election JSON payload. | Node.js creates election in DB, returns 201; UI redirects to dashboard. | Pending |
| INT-2.3 | Voter Casts Ballot | Authorized voter casts encrypted vote. | Node.js logic verifies eligibility, updates Postgres, returns success. UI shows confirmation. | Pending |
| INT-2.4 | Double Voting Prevention | UI repeatedly sends `/cast-vote` payload. | Node.js processes first, rejects subsequent with 403 Forbidden; UI handles gracefully. | Pending |

### Suite 3: Backend APIs to Database (Flask / Node.js ↔ PostgreSQL)
This suite validates that backend services translate models directly into robust database queries.

| Test Case ID | Scenario Description | Input/Pre-condition | Expected Outcome | Status |
|---|---|---|---|---|
| INT-3.1 | PII Hashing on Save | Flask API saves new user details. | Phone numbers/IDs are securely hashed via SHA-256 before committing to Postgres. | Pending |
| INT-3.2 | Blockchain Hash Integrity | Node.js API registers a new cast vote. | Preceding block hash is fetched; new hash correctly calculated and committed atomically. | Pending |
| INT-3.3 | Database Connection Pooling | Simulate 100 simultaneous requests. | Postgres handles connections without timeout; APIs return stable responses. | Pending |

### Suite 4: Reverse Proxy Routing (Nginx ↔ Services)
This suite verifies network routing and security layers.

| Test Case ID | Scenario Description | Input/Pre-condition | Expected Outcome | Status |
|---|---|---|---|---|
| INT-4.1 | Route `/api/*` resolution | Request made to `https://localhost/api/`. | Nginx correctly proxies to Port 5000 (Flask). | Pending |
| INT-4.2 | Route `/voting/*` resolution | Request made to `https://localhost/voting/`. | Nginx correctly proxies to Port 5002 (Node.js). | Pending |
| INT-4.3 | HTTP to HTTPS Redirect | Unsecured HTTP request made to Port 80. | Nginx redirects with 301 to `https://` equivalent. | Pending |

---

## 5. Environment & Tools
- **Automation Framework:** Postman / Newman (API Level), Cypress (E2E Integration)
- **Database Tooling:** pgAdmin / direct psql for verification queries
- **Mocking:** Mock OTP responses during integration testing to prevent rate limitations.

## 6. Exit Criteria
- 100% of P0 & P1 Integration Test Cases are executed and Passed.
- No critical data-transfer bottlenecks or unhandled internal server errors (5xx) detected.
- JWT and session continuity is verified seamlessly across all distributed domains and ports.
