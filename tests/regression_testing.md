# Regression Testing Strategy and Protocol
## Secure Electronic Voting System

---

## 1. Executive Summary
Regression Testing is a vital quality assurance process applied to the **Secure Electronic Voting System**. Its purpose is to ensure that code modifications—such as adding new features (e.g., enhanced biometric models), finalizing bug fixes, or updating foundational libraries—do not inadvertently break or degrade existing, tested functionalities. Given the mission-critical nature of electronic voting, establishing an unyielding regression baseline is paramount for auditing and transparency.

## 2. Objective
- **Sustain Functional Integrity:** Guarantee that older modules (e.g., identity verification, anonymized balloting, cryptographic hashing) function flawlessly after any new codebase merges.
- **Maintain Security Baselines:** Validate that crucial security protocols (Rate Limiting, PII Hashing, HTTP to HTTPS redirection, JWT verification) continue protecting the system post-update.
- **Defect Prevention:** Proactively expose hidden side-effects or configuration drifts between React UI, Express Node.js Voting Core, and Flask Biometric API.

## 3. Regression Scope and Methodology
Whenever developers introduce modifications (PRs) to the `main` or `staging` branches, automated CI/CD pipelines alongside manual sanity checks invoke the Regression Test Suite. The scope heavily covers the unchangeable "Golden Workflows" required for the voting lifecycle.

### Scope Includes:
1. **Core Authentication Mechanisms:** OTP dispatch, Session token issuance, biometric face encoding matching.
2. **Blockchain & Database Transactions:** Immutable append-only behavior of the vote tally database and consistency of block hashes.
3. **Admin Controls:** RBAC (Role-Based Access Control) restrictions preventing non-admins from altering elections.

---

## 4. Regression Test Catalog

### 4.1. Identity & Biometric Verification Baseline
Testing the unchanged dependencies within the Flask API.

| Test ID | Scenario | Verification Step | Expected Status | Regression Impact |
|:---:|---|---|---|---|
| REG-1.1 | OCR Identification Pass | Pass a known valid ID image through `/api/verify-document`. | Returns valid extracted dictionary. | System Halt |
| REG-1.2 | OCR Identification Fail | Pass an invalid or blurred document. | Rejects with 400 Bad Request. | System Halt |
| REG-1.3 | Face Authorization | Submits standard face encoding dataset. | Flask API returns correct mapped User. | System Halt |

### 4.2. API Security & Role Based Access Control
Testing network middleware and token validation via Node.js Express.

| Test ID | Scenario | Verification Step | Expected Status | Regression Impact |
|:---:|---|---|---|---|
| REG-2.1 | JWT Tempering Attempt | Edit standard payload of valid JWT and request Admin resource. | Middleware detects corrupted signature, returns 401 Unauthorized. | Moderate - Halt |
| REG-2.2 | Cross-Role Access | Attempt to execute `POST /voting/create-election` logged in as a standard Voter. | Route strictly returns 403 Forbidden. | High Risk |
| REG-2.3 | MFA Rate Limits | Exceed login attempts past 5/minute. | Returns 429 Too Many Requests; sets timeout header. | High Risk |

### 4.3. Election State & Integrity Mechanics
Testing that new dashboard additions or date changes do not skew active election physics.

| Test ID | Scenario | Verification Step | Expected Status | Regression Impact |
|:---:|---|---|---|---|
| REG-3.1 | Post-Election Voting Attempt | Voter attempts to post vote against closed ID. | System flags election inactive, blocks logic via Node.js before DB execution. | System Halt |
| REG-3.2 | Duplicate Cast Request | Simulate same-voter identical POST payload for an active election. | Primary Key constraint OR Controller logic blocks transaction; returns error. | System Halt |
| REG-3.3 | Cryptographic Tally Hash | Calculate sum of entire DB ledger hash chain. | Last Block's `previous_hash` iteratively resolves back to the Genesis block flawlessly. | System Halt |

---

## 5. Automated Regression Tooling
The regression catalog is managed structurally via Git workflows to minimize engineering overhead.

| Framework | Domain Tested | Execution Frequency |
|---|---|---|
| **PyTest (v9.0)** | Python Backend (Auth, Cryptography) | Nightly Builds & On-Commit. |
| **Jest / Vitest** | UI Unit Logic & State Management | Nightly Builds & On-Commit. |
| **Newman (Postman CLI)** | End-to-End API contracts | Pre-Release Merges & Staging Deployments. |

## 6. Defect Resolution Lifecycle
1. **Detection:** Should any REG-* test case fail during the automated runs, CI/CD marks the build "Broken".
2. **Investigation:** Developers must debug the respective microservice container logs via `docker compose logs`.
3. **Resolution:** Code fixes must include exactly why the regression failed, appending a specific unit test covering the newly discovered edge case before re-merging.

---
*Maintained under strict QA Compliance.*
