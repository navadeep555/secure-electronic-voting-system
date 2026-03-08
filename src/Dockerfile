# ==============================================================
# src/Dockerfile – React/Vite SPA (Production Build)
# Multi-stage: Build with Node.js → Serve with Nginx
# ==============================================================
# Build context: project root (run from repo root)
#   docker build -f src/Dockerfile -t voting-frontend .
# ==============================================================
# This Dockerfile does NOT modify any existing source files.
# Frontend source lives in src/ (this directory).
# ==============================================================

# ── Stage 1: Build React/Vite SPA ─────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /build

# Copy package files for layer caching
COPY package.json package-lock.json* bun.lockb* ./

# Install dependencies
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy the full frontend project from repo root
COPY index.html vite.config.ts tsconfig*.json postcss.config.js tailwind.config.ts ./
COPY public/ ./public/
COPY src/ ./src/
COPY components.json ./

# Build the production bundle → dist/
RUN npm run build


# ── Stage 2: Serve with Nginx ─────────────────────────────────
FROM nginx:1.25-alpine AS runtime

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app from builder
COPY --from=builder /build/dist /usr/share/nginx/html

# SPA routing config (try_files fallback for React Router)
COPY devops/nginx/spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD /bin/sh -c 'printf "GET / HTTP/1.0\r\n\r\n" | nc -w 2 localhost 80 | head -1 | grep -q "HTTP"'

CMD ["nginx", "-g", "daemon off;"]
