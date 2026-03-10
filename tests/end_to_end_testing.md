# End-to-End (E2E) Testing Strategy and Execution Plan
## Secure Electronic Voting System

---

## 1. Executive Summary
End-to-End Testing (E2E) involves testing the system from beginning to end, essentially mirroring user behavior under real-world scenarios. In the context of the **Secure Electronic Voting System**, this involves emulating both Voter and Admin journeys—validating operations securely flowing from the React UI, through Nginx, into Flask or Node.js microservices, and finalizing securely in the PostgreSQL database.

## 2. Objective
- **Complete Feature Validation:** Ensure the full process of identity verification, OTP login, casting a vote, and tallying results performs optimally from start to finish.
- **Architectural Validation:** Validate the entire technical stack (UI → Reverse Proxy → App Server → Database).
- **Usability Validation:** Ensure that edge cases and error handling map to legible user notifications in the interface.

## 3. Pre-Requisites
1. **Docker Ecosystem Deployed**: The stack (`UI`, `Flask API`, `Node.js API`, `PostgreSQL`, `Nginx`) must be fully active using `docker compose up`.
2. **Environment Variable Configuration Base**: Necessary `.env` configurations (Keys, database credentials, dummy JWT secret) must be populated.
3. **Database Pre-populated**: Basic data setup, such as a dummy election initialized by an Admin, allowing immediate testing of the Voter cast route.

---

## 4. E2E Core Journeys (Golden Paths)

### Journey 1: The Voter Registration and Biometric Verification
**Description:** Emulates a new voter registering and enrolling biometrics with the platform.

| Step | Action Performed | Expected Sub-Outcome | Failure Criteria |
|---|---|---|---|
| 1 | Voter navigates to `https://localhost` and selects "Register". | Secure UI renders standard form. | Form submits via HTTP (not HTTPS). |
| 2 | Submits basic details and uploads valid government ID. | OCR backend reads name/ID; successfully verifies legitimacy. | API denies access on valid ID. |
| 3 | Allows webcam access and captures facial encoding. | WebRTC captures frame; base64 payload is securely sent to Flask API. | No frame encoded; API timeouts. |
| 4 | Receives SMS/Email OTP to finalize the registration. | Registration completes successfully; database securely hashes PII and stores biometrics. | Hash collision; raw PII saved. |

### Journey 2: Anonymized Voting Action (The Golden Path)
**Description:** Emulates an enrolled voter successfully logging in, bypassing security hurdles, and casting a secure, untraceable vote.

| Step | Action Performed | Expected Sub-Outcome | Failure Criteria |
|---|---|---|---|
| 1 | Voter attempts to login by looking at the webcam. | Encoded frame correlates to DB match. | Spoofed photo bypasses check. |
| 2 | Voter inputs the OTP sent dynamically to their device. | Node.js API verifies OTP & face match, generates and passes JWT session token. | Session persists after early browser quit. |
| 3 | Voter opens the Active Election dashboard. | Real-time election updates are fetched securely. UI locks disabled buttons for ended elections. | Election dates manipulate local system clock. |
| 4 | Voter selects Candidate A and finalizes "Cast Vote". | UI immediately disables button to prevent double voting. Payload sent. | Multiple payloads transmitted via network lag. |
| 5 | Blockchain Verification checks for consistency. | Node.js calculates cryptographic links. Returns success and unique receipt hash back to UI. | Chain breaks after appending block. |

### Journey 3: The Administrator Election Lifecycle
**Description:** Emulates an Admin configuring an election workflow, adding candidates, and declaring results.

| Step | Action Performed | Expected Sub-Outcome | Failure Criteria |
|---|---|---|---|
| 1 | Admin correctly logs in as the Master Administrator. | Dashboard displays sensitive global statistics and analytics. | Standard Voter accesses `/admin`. |
| 2 | Create Election entity specifying start/end timestamp. | Express API registers `ElectionStatus: Scheduled` or `Active`. | Admin can set end date before start. |
| 3 | Admin uploads candidate metadata and photos. | Candidates successfully map to the Election entity. | Images exceed capacity or corrupt system. |
| 4 | Admin triggers `End Election` command precisely on time. | Real-time dashboards freeze; further vote attempts return 403 Forbidden. | API allows votes post-closure. |
| 5 | Admin accesses the final tally and generates the report. | System triggers a recount from foundational DB chains, confirming the live tally. | Discrepancy between UI tally and DB trace. |

---

## 5. Non-Functional E2E Assertions
| Testing Vector | Verification Description | Tooling Focus |
|---|---|---|
| **Rate Limiting** | Ensure rapid brute-force logins automatically suspend IP addresses. | Simulated automated Curl/Cypress loops. |
| **Concurrency / Double Vote** | Simulate 5 identical payloads attempting to vote for the same ID at the exact millisecond. | Ensure Postgres Locks (`SERIALIZABLE` isolation) permits exactly 1 request. |
| **Failure Recovery** | Shut down Flask API while a voter is filling out OTP. | Ensure the UI gracefully informs the Voter of server maintenance instead of hanging natively. |

## 6. Execution Tracking
All End-to-End tests will be automated incrementally using **Cypress** mapping these steps against a test database environment deployed via CI/CD (GitHub Actions). All anomalies will be documented inside JIRA.
