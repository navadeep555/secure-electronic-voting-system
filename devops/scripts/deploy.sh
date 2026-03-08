#!/usr/bin/env bash
# ==============================================================
# deploy.sh – Full Stack Deployment Script
# Secure Electronic Voting System – EPIC 6 US6.3
#
# Usage:
#   bash devops/scripts/deploy.sh [--dev]
#
# Options:
#   --dev    Use HTTP-only development config (no TLS)
#   (none)   Full production deployment with HTTPS
# ==============================================================
set -euo pipefail

DEV_MODE=false
if [[ "${1:-}" == "--dev" ]]; then
    DEV_MODE=true
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/docker-compose.yml"
CERTS_DIR="${ROOT_DIR}/devops/ssl/certs"

print_banner() {
    echo ""
    echo "  ╔══════════════════════════════════════════════════╗"
    echo "  ║   Secure Electronic Voting System – Deployer     ║"
    echo "  ║   EPIC 6 US6.3 – Secure Communication           ║"
    echo "  ╚══════════════════════════════════════════════════╝"
    echo ""
}

check_dependencies() {
    echo "[✓] Checking dependencies..."
    for cmd in docker; do
        if ! command -v "$cmd" &>/dev/null; then
            echo "[✗] '$cmd' is not installed. Please install it first."
            exit 1
        fi
    done
    if ! docker compose version &>/dev/null; then
        echo "[✗] 'docker compose' plugin not found. Please install Docker Compose V2."
        exit 1
    fi
    echo "    docker: $(docker --version)"
    echo "    docker compose: $(docker compose version --short)"
}

check_env_file() {
    echo ""
    echo "[✓] Checking environment configuration..."
    if [[ ! -f "${ROOT_DIR}/.env" ]]; then
        echo "[!] .env not found. Creating from .env.example..."
        cp "${ROOT_DIR}/.env.example" "${ROOT_DIR}/.env"
        echo ""
        echo "⚠  IMPORTANT: Edit .env with your real secrets before proceeding!"
        echo "   File: ${ROOT_DIR}/.env"
        echo ""
        read -r -p "Press ENTER to continue after editing .env, or Ctrl+C to quit..."
    fi
    echo "    .env: OK"
}

check_certificates() {
    if [[ "$DEV_MODE" == true ]]; then
        echo "[!] Dev mode: skipping certificate check"
        return
    fi

    echo ""
    echo "[✓] Checking TLS certificates..."
    if [[ ! -f "${CERTS_DIR}/server.crt" ]] || [[ ! -f "${CERTS_DIR}/server.key" ]]; then
        echo "[!] TLS certificates not found. Generating self-signed certificates..."
        bash "${ROOT_DIR}/devops/ssl/gen-certs.sh"
    else
        echo "    server.crt: OK"
        echo "    server.key: OK"
        # Show expiry
        EXPIRY=$(openssl x509 -enddate -noout -in "${CERTS_DIR}/server.crt" 2>/dev/null | cut -d= -f2 || echo "unknown")
        echo "    Certificate expires: ${EXPIRY}"
    fi
}

deploy() {
    echo ""
    if [[ "$DEV_MODE" == true ]]; then
        echo "[►] Starting in DEVELOPMENT mode (HTTP only)..."
    else
        echo "[►] Starting in PRODUCTION mode (HTTPS)..."
    fi
    echo ""

    cd "${ROOT_DIR}"

    # Build and start all services
    docker compose -f "${COMPOSE_FILE}" up --build -d

    echo ""
    echo "[✓] Waiting for services to become healthy..."
    sleep 10

    # Show service status
    docker compose -f "${COMPOSE_FILE}" ps
}

health_check() {
    echo ""
    echo "[✓] Running health checks..."

    local BASE_URL
    if [[ "$DEV_MODE" == true ]]; then
        BASE_URL="http://localhost"
    else
        BASE_URL="https://localhost"
    fi

    # Check HTTP redirect (only in prod mode)
    if [[ "$DEV_MODE" == false ]]; then
        HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" --max-time 10 http://localhost || echo "000")
        if [[ "$HTTP_CODE" == "301" ]] || [[ "$HTTP_CODE" == "302" ]]; then
            echo "    ✓ HTTP → HTTPS redirect: ACTIVE (${HTTP_CODE})"
        else
            echo "    ⚠ HTTP redirect returned: ${HTTP_CODE} (expected 301/302)"
        fi
    fi

    # Check API
    API_CODE=$(curl -kso /dev/null -w "%{http_code}" --max-time 15 "${BASE_URL}/api/elections" || echo "000")
    if [[ "$API_CODE" == "200" ]]; then
        echo "    ✓ Flask API (/api/elections): HEALTHY (200)"
    else
        echo "    ⚠ Flask API returned: ${API_CODE}"
    fi

    # Check security headers (prod only)
    if [[ "$DEV_MODE" == false ]]; then
        HSTS=$(curl -kIs --max-time 10 "${BASE_URL}" | grep -i "strict-transport" | head -1)
        if [[ -n "$HSTS" ]]; then
            echo "    ✓ HSTS header: PRESENT"
        else
            echo "    ⚠ HSTS header: NOT FOUND"
        fi
    fi
}

print_summary() {
    echo ""
    echo "  ════════════════════════════════════════════════"
    if [[ "$DEV_MODE" == true ]]; then
        echo "  🌐  App URL:  http://localhost"
        echo "  🔌  API:      http://localhost/api/"
    else
        echo "  🔒  App URL:  https://localhost"
        echo "  🔌  API:      https://localhost/api/"
        echo "  🔒  TLS:      Self-signed (see devops/ssl/certs/)"
    fi
    echo ""
    echo "  📋  Logs:     docker compose logs -f"
    echo "  🛑  Stop:     docker compose down"
    echo "  ════════════════════════════════════════════════"
    echo ""
}

# ── Main ──────────────────────────────────────────────────────
print_banner
check_dependencies
check_env_file
check_certificates
deploy
health_check
print_summary
