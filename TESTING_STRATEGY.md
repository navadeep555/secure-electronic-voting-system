# SecureVote Testing Strategy

This document defines the comprehensive quality assurance framework for the SecureVote Identity & Voting ecosystem, ensuring that every layer of the multi-role platform (Voter, Admin) is verified for anonymity, security, correctness, and reliability.

---

## 1. Component-Specific Testing Matrix

This matrix identifies how each architectural tier is tested and the specific properties verified for the Electronic Voting System.

| Component | Test Level | Properties Tested | Tools & Libraries |
| :--- | :--- | :--- | :--- |
| **Backend API (Flask)** | Unit & Integration | **Double Voting Prevention** (1-to-1 ratio), **Hashing Integrity** (SHA-256), **Blockchain Consistency**, **Tamper Detection**. | Pytest 9.0, Python 3.11, Postman |
| **Frontend Web (React)** | Unit & E2E | **Auth Guard Protection**, **Double-Submission Prevention** (UI Locking), UI State Management. | Vitest 4.0.18, React Testing Library, JSDOM |
| **Database (SQLite)** | Integration | Blockchain Hashing Integrity (Hash Link Validation), Atomic Locks, Tamper Evidence. | Pytest, SQL Scripts |
| **ML Engine** | Unit | Face Encoding Accuracy, OCR Identity Verification ("IDENTITY"/"INDIA"). | dlib, numpy, PyTest |

---

## 2. Testing Levels & Methodologies

### **A. Unit Testing (Isolated Logic)**
*   **Backend**: Focuses on core cryptographic and logic checks:
    *   **Hashing Integrity**: Validates standards compliance by comparing `compute_hash` with hashlib's SHA-256.
    *   **Tamper Detection**: Verifies that manual database modifications (`TAMPERED_VOTE`) trigger cryptographic mismatches.
*   **Frontend**: Verifies component logic using **JSDOM**:
    *   **Auth Guard**: Ensures `ProtectedRoute` intercepts unauthenticated requests and redirects to `/login`.
    *   **Double-Submission**: Validates that voting triggers immediately toggle UI state to disabled.
*   **ML**: Validates utility functions for OCR extraction and face encoding storage.

### **B. Integration Testing (Service Interoperability)**
*   **REST API Level**: Using **Postman** to verify the end-to-end flow:
    *   **Identity**: `POST /api/verify-document` (OCR Validation).
    *   **Auth**: `POST /api/recognize-face` (Step A) -> `POST /api/verify-otp` (Step B).
    *   **Voting**: `POST /api/voter/cast-vote` (Requires Bearer Token & PIN).
*   **Auth Flow**: Verifies that JWT tokens correctly encode roles and that `election_voters` registry prevents reuse of tokens for the same election.
*   **Blockchain Consistency**: Validates the "Hash Link" by ensuring each block’s `previous_hash` matches the preceding block's `block_hash`.

### **C. System & E2E Testing (User Workflows)**
*   **The Golden Path**: Manual and automated walkthroughs verifying the sequence:  
    `Identity Verification (OCR)` -> `Biometric Registration` -> `2-Step Login (Face+OTP)` -> `Cast Anonymous Ballot` -> `Blockchain Verification`.
*   **Concurrency Handling**: Testing the system to ensure the ledger remains consistent and rejects simultaneous double-votes.

---

## 3. Properties Verified per Component

### **1. 🔐 Security & Access Control**
*   **Frontend**: Verified that **Auth Guard** logic prevents access to private routes without a valid session.
*   **Backend**: Ensuring **Double Voting Prevention** returns `403 Forbidden` if a token is reused for the same election.
*   **Authentication**: Validating the 2-Step Logic (Face Recognition -> OTP -> JWT Generation).

### **2. 📍 Reliability & Integrity**
*   **Backend**: **Hashing Integrity** checks ensuring standard SHA-256 compliance.
*   **System**: Verification of **Blockchain Consistency** (Chain Integrity) where Hash N depends strictly on Hash N-1.

### **3. ✅ Transactional Correctness**
*   **Frontend**: **Double-Submission Prevention** ensuring UI locks immediately to prevent accidental duplicate requests.
*   **Backend**: **Tamper Detection** mechanisms that flag any unauthorized direct database modifications.

---

## 4. Test Infrastructure & Automations

| Platform | Role | Details |
| :--- | :--- | :--- |
| **Postman** | Primary tool for API Unit Testing and Integration validation. | Validates endpoints: `/api/verify-document`, `/api/cast-vote`, etc. |
| **Pytest** | Automated test runner for Python backend logic and database assertions. | **v9.0**, Python 3.11, checks Hashing & Ledger. |
| **Vitest** | Frontend test runner for React components and utility logic. | **v4.0.18**, JSDOM, React Testing Library. |
| **Locust** | (Planned) Load testing tool to simulate 1000+ concurrent voters. | Future Implementation. |

--- 
*Last Updated: February 11, 2026*
