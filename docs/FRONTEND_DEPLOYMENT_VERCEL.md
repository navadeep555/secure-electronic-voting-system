# 🌍 Frontend Deployment Guide - Vercel

## 📌 Executive Overview

This technical guide outlines the exact, step-by-step procedure for deploying the **Secure Electronic Voting System** Frontend to the Vercel Edge Network. 

The frontend uses **React + Vite** and is uniquely engineered to communicate with two mathematically separate API backends (Flask Admin & Node Voting Core) via seamless Cloud Routing.

---

## 📋 Prerequisites

Before initiating the cloud deployment, ensure:
1. **Vercel Account:** An active workspace at [vercel.com](https://vercel.com).
2. **Repository Access:** GitHub/GitLab integration authorized for the Vercel app.
3. **Backend Architectures Deployed:** Both the Python and Node.js backend services must already be live (See [`BACKEND_DEPLOYMENT_RENDER.md`](./BACKEND_DEPLOYMENT_RENDER.md)).

---

## 🚀 Deployment Procedure

### Step 1: Initialize Vercel Project
1. Navigate to the **Vercel Dashboard** and click **"Add New..."** → **"Project"**.
2. Select the Git repository containing the Secure Electronic Voting System code.
3. Vercel's deep-scanning will automatically detect the presence of `index.html` and `vite.config.ts` in the root repository.

### Step 2: Configure Build Optimizations
The Vercel build container must be explicitly configured to prevent building the backend folders.

| Setting | Value | Rationale |
| :--- | :--- | :--- |
| **Framework Preset** | `Vite` | Auto-detects React optimization flags |
| **Root Directory** | `./` | The `package.json` for React is located in the mono-repo root |
| **Build Command** | `npm run build` | Initiates Vite compilation |
| **Output Directory** | `dist` | The standard ESM output path |
| **Install Command** | `npm install` | Hydrates the UI dependencies |

### Step 3: Inject Environment Variables
> [!IMPORTANT]
> Because our system uses `vercel.json` rewrites to securely mask the backend URLs, you generally **do not** need to expose database or backend URLs to the React `.env` files.

If specific UI toggles or external analytics keys are needed later, they must be prefixed with `VITE_` to be exposed to the React DOM context:
- *Example:* `VITE_BETA_FEATURE_ENABLED=true`

### Step 4: Execute Edge Deployment
1. Click **Deploy**.
2. Vercel will instantiate an `ubuntu` container, execute `npm run build`, minify the TSX files into chunked JS, and push the `/dist` bundle to their Global Edge CDN in < 45 seconds.

---

## 🗺️ The `vercel.json` Routing Architecture

This codebase does **not** hardcode API URLs in React. Instead, Vercel acts as a Secure API Gateway. 

The `vercel.json` file dictates that when React calls `/api/voter/...`, Vercel silently intercepts the request and relays it to the Node Core. When it calls `/api/admin/...`, it routes to Flask.

```json
{
  "rewrites": [
    { 
      "source": "/api/voter/:path*", 
      "destination": "https://voting-core-api.onrender.com/api/voter/:path*" 
    },
    { 
      "source": "/api/:path*", 
      "destination": "https://voting-flask-api.onrender.com/api/:path*" 
    },
    { 
      "source": "/(.*)", 
      "destination": "/index.html" 
    }
  ]
}
```
> [!NOTE]
> The exact `voting-core-api.onrender.com` strings in `vercel.json` must be manually updated to match the URLs generated during your Backend Phase.

---

## 🚨 Troubleshooting Cloud Errors

### Issue 1: `404 Not Found` on Refresh
**Error:** Refreshing any page other than `/` yields a 404 page.
**Solution:**
- Your `vercel.json` file is missing or invalid. The Vercel Gateway needs `{ "source": "/(.*)", "destination": "/index.html" }` to allow React-Router to handle HTML5 History API navigations.

### Issue 2: `502 Bad Gateway` on API Calls
**Error:** React makes an API call, but receives a 502 HTML page instead of JSON.
**Solution:**
- The `destination` URLs inside `vercel.json` are inactive. Verify that Render hasn't spun-down the free backend containers, or check that the URLs actually point to your live Render instances.

### Issue 3: Build Memory Exhaustion
**Error:** Vercel deployment fails with `Killed` or `OOM`.
**Solution:**
- Vite occasionally aggressively typechecks. You can append `tsc && vite build --emptyOutDir` to force a cleaner TypeScript allocation, or temporarily bypass TSC in the build script if purely testing UI changes.

---

## 📊 Post-Deployment Operations

### Web Analytics & Speed Insights
Vercel offers native, GDPR-compliant Edge Analytics. Navigate to the **Speed Insights** tab in your Vercel Dashboard to visualize First Contentful Paint (FCP) and Time to Interactive (TTI) for voters in low-bandwidth regions.

### Cloud Flare / Custom Domains
To strip the `.vercel.app` suffix:
1. Go to **Settings** → **Domains**.
2. Bind your `example.com` domain.
3. Vercel will automatically provision and auto-renew the TLS/SSL Certificates Let's Encrypt pipeline for secure `https://` access.
