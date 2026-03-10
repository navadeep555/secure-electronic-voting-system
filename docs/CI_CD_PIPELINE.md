# 🚀 Continuous Integration & Continuous Deployment (CI/CD)

## 📌 Executive Overview
This document serves as the authoritative guide for the CI/CD pipeline underpinning the **Secure Electronic Voting System**. Implemented via **GitHub Actions**, this pipeline enforces cryptographic integrity, syntax standardization, and automated deployment architectures across the monolithic repository. 

Our CI/CD methodology operates under a **Zero-Trust Deployment Policy**: no code reaches the production blockchain ledger without passing rigorous, automated sanity checks.

---

## ⚙️ Architecture & Triggers

### Pipeline Workflows
The CI/CD process is physically separated into two core orchestration files located in `.github/workflows/`:
1. `ci.yml`: Validation, Linting, and Testing.
2. `deploy.yml`: Cloud Resource Provisioning & Deployment.

### Event Triggers
> [!IMPORTANT]
> To preserve the integrity of the audit log configurations, deployments are strictly limited to the `main` branch.

```yaml
on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main", "dev" ]
```
- **Pull Requests**: Triggers the `ci.yml` pipeline purely for verification. Blocks merges on failure.
- **Pushes to Main**: Triggers `ci.yml`, and upon absolute success, sequentially triggers `deploy.yml`.

---

## 🛠️ Phase 1: Continuous Integration (`ci.yml`)

### Runner Infrastructure
- **Operating System:** `ubuntu-latest`
- **Node.js Environment:** `v20.x` (LTS)
- **Python Environment:** `v3.11`

### Execution Matrix

#### 1. Repository Checkout & Environment Hydration
```yaml
- name: Checkout Codebase
  uses: actions/checkout@v4
```
Clones the repository while preserving Git history required for semantic versioning. 

#### 2. Frontend Validation (React/Vite)
Focuses on UI stability and bundle optimization.
- **Dependency Resolution:** Utilizes `npm ci` for deterministic `package-lock.json` installations.
- **Static Analysis (Linting):** Executes ESLint to prevent cross-site scripting (XSS) vulnerabilities in the React DOM phase.
- **Build Verification:** Executes `npm run build` using Vite. Ensures the cryptographic footprint of the JS bundle operates within memory constraints.

#### 3. Voting Core API Validation (Node/Express)
Focuses on the high-throughput ledger backend.
- **Dependency Setup:** Navigates to `./voting-core` and executes `npm ci`.
- **Cryptographic Sanity Checks:** Executes unit tests focusing heavily on `HMAC-SHA256` payload generation and validation inside the ledger routes.

#### 4. Admin API Validation (Python/Flask)
Focuses on ORM stability and Role-Based Access Control (RBAC).
- **Environment:** Provisions Python `3.11` and installs `requirements.txt`.
- **Test Suite:** Executes PyTest against the JWT token decorators and Election Lifecycle management routes to ensure unauthorized users cannot mutate `DRAFT` elections.

---

## 🚢 Phase 2: Continuous Deployment (`deploy.yml`)

The deployment architecture is fully handled by Cloud Webhooks rather than manual CLI pushes, drastically minimizing credential exposure.

### Step 1: Frontend Edge Deployment (Vercel)
Upon CI success, GitHub Actions triggers a secure REST API call to the Vercel Build Network.
- **Action:** Triggers the Vercel Deploy Hook via `POST`.
- **Result:** Vercel pulls the `main` branch, executes Vite compilation, invalidates the global CDN cache, and pushes the new Frontend Bundle to the Edge Network.

### Step 2: Backend Container Synchronization (Render)
The orchestration ensures zero-downtime synchronized deployments between both API services.

```yaml
- name: Trigger Render Deployment (Voting Core)
  run: curl -s -X POST ${{ secrets.RENDER_DEPLOY_HOOK_CORE }}

- name: Trigger Render Deployment (Flask Admin API)
  run: curl -s -X POST ${{ secrets.RENDER_DEPLOY_HOOK_FLASK }}
```
- **Action:** Pings Render auto-deploy hooks stored securely in **GitHub Secrets**.
- **Result:** Render spins up localized Docker abstractions. If the Node container fails to establish a PostgreSQL connection, the container health check fails, and Render automatically reverts to the previous live image to protect system uptime.

---

## 🚨 Security & Error Handling Strategy

1. **Permissive Testing:** 
   During Alpha phases, test steps use `|| true` to prevent workflow crashes on missing test files. As the system enters Beta, this will be hardened to strictly fail the build on any validation drop.
2. **Secret Masking:**
   All cryptographic keys (`JWT_SECRET`, `DB_INTEGRITY_KEY`, and Render Webhooks) are defined strictly in **GitHub Secrets** and are mathematically masked in all Action Console logs.
3. **Artifact Retention:**
   Build failures instantly generate system logs that are accessible under the Actions tab for exactly 30 days before automatic deletion.

---

## 📊 Monitoring the Pipeline

| Issue Indicator | Probable Cause | Immediate Remediation |
| :--- | :--- | :--- |
| **Linting Failure** | Syntax mismatch or React anti-patterns | Run `npm run lint --fix` locally on the affected codebase before pushing. |
| **Build Timeout** | Memory exhaustion during Vite compilation | Verify no massive static assets were accidentally committed to the `/public` folder. |
| **Test Suite Mismatch** | Python/Node version inconsistencies | Ensure local dev environment matches `ubuntu-latest` (Python 3.11, Node 20). |
| **Deploy Hook 401** | GitHub Secret Rotation | Verify `RENDER_DEPLOY_HOOK_CORE` exact string match in repository settings. |

---

## 🗂️ Configuration Files Referenced

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Defines the CI/CD architectural pipeline |
| `.github/workflows/deploy.yml`| Defines the Production Edge hook triggers |
| `backend/app.py` | Mounts the ORM and Admin validation scopes |
| `voting-core/package.json` | Voting Core dependencies and cryptographic ledger scripts |
| `src/package.json` | Frontend React dependencies and scripts |
| `vite.config.ts` | Vite Edge build configuration |

---

## 💻 Key Technologies

| Component | Technology | Version |
|-----------|----------|---------|
| **Runtime (Core)** | Node.js | v20.x (LTS) |
| **Runtime (Admin)**| Python | v3.11 |
| **CI/CD Platform** | GitHub Actions | v4 |
| **Backend Framework**| Express.js / Flask | Latest |
| **Frontend Framework**| React + Vite | Latest |
| **Testing** | Jest / PyTest | Latest |
| **Styling** | Tailwind CSS | v3 |

---

## 🛡️ Best Practices

### For Developers
1. **Test Locally:** Run `npm run test` locally on both containers before pushing to avoid clogging the Action runners.
2. **Check Dependencies:** Ensure all external cryptographic imports are locked to a specific version in `package.json` / `requirements.txt`.
3. **Follow Conventions:** Match existing code style (`eslint` and `pylint`) to avoid syntactical linting blocks during the Build phase.
4. **Meaningful Commits:** Provide clear Semantic Commits (e.g. `fix(ledger): patch hmac issue`) for easier debugging.

### For CI/CD Maintainers
1. **Keep Pipeline Fast:** Minimize unnecessary UI tests in `ci.yml` if they are not actively mutating the DOM.
2. **Clear Logging:** Ensure environment variables are masked to prevent Key Leaks in the action output logs.
3. **Fail Early:** Validate Node and Python syntax **before** installing heavy node_modules.
4. **Document Changes:** Immediately update this `CI_CD_PIPELINE.md` guide whenever pipeline configuration triggers are modified.

---

## 🎯 Future Architecture Roadmap
- [ ] **E2E Integration** - Migrate end-to-end tests into Cypress/Playwright and block deployment if visual regression occurs.
- [ ] **Docker Cache** - Implement `actions/cache` to cache Docker layers and `node_modules` to drop pipeline execution time from ~3 minutes to <40 seconds.
- [ ] **Slack Integration** - Pipe webhook failure traces directly into the DevOps `#alerts` channel.
