# ==============================================================
# voting-core/Dockerfile – Node.js Voting Core Backend
# Packages the voting-core/ TypeScript service
# ==============================================================
# This Dockerfile does NOT modify any existing source files.
# It only packages the existing voting-core/ directory.
# ==============================================================

# ── Stage 1: Build (TypeScript → JavaScript) ──────────────────
FROM node:20-alpine AS builder

WORKDIR /build

# Copy package files first for layer caching
COPY voting-core/package.json voting-core/package-lock.json* ./

# Install all deps (including devDeps for TypeScript compilation)
RUN npm ci --legacy-peer-deps

# Copy TypeScript source
COPY voting-core/tsconfig.json ./
COPY voting-core/src/ ./src/

# Compile TypeScript to JavaScript
RUN npm run build


# ── Stage 2: Runtime image ────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

# Install only production dependencies
COPY voting-core/package.json voting-core/package-lock.json* ./
RUN npm ci --only=production --legacy-peer-deps

# Copy compiled JavaScript from builder stage
COPY --from=builder /build/dist ./dist

# Create SQLite data directory
RUN mkdir -p /app/data

# Expose voting-core port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget -qO- http://localhost:3001/health 2>/dev/null || exit 1

# Run the compiled server
CMD ["node", "dist/server.js"]
