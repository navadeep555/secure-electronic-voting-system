#!/usr/bin/env bash
# ============================================================
# gen-certs.sh – Generate self-signed TLS certificates
# Usage: bash devops/ssl/gen-certs.sh
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERTS_DIR="${SCRIPT_DIR}/certs"
DAYS=365

echo "========================================"
echo " Secure Voting System – TLS Certificate"
echo " Generator (Self-Signed / Development)  "
echo "========================================"

mkdir -p "${CERTS_DIR}"

# ── 1. Generate CA private key + self-signed root cert ─────
echo ""
echo "[1/4] Generating CA root key and certificate..."
openssl genrsa -out "${CERTS_DIR}/ca.key" 4096 2>/dev/null
openssl req -new -x509 -days ${DAYS} \
    -key "${CERTS_DIR}/ca.key" \
    -out "${CERTS_DIR}/ca.crt" \
    -subj "/C=IN/ST=Telangana/L=Hyderabad/O=Voting System CA/CN=VotingCA" \
    2>/dev/null
echo "    ✓ CA certificate: ${CERTS_DIR}/ca.crt"

# ── 2. Generate server private key + CSR ───────────────────
echo ""
echo "[2/4] Generating server private key and CSR..."
openssl genrsa -out "${CERTS_DIR}/server.key" 2048 2>/dev/null
openssl req -new \
    -key "${CERTS_DIR}/server.key" \
    -out "${CERTS_DIR}/server.csr" \
    -config "${SCRIPT_DIR}/openssl.cnf" \
    2>/dev/null
echo "    ✓ Server key:  ${CERTS_DIR}/server.key"
echo "    ✓ Server CSR:  ${CERTS_DIR}/server.csr"

# ── 3. Sign server cert with CA ────────────────────────────
echo ""
echo "[3/4] Signing server certificate with CA..."
openssl x509 -req \
    -in "${CERTS_DIR}/server.csr" \
    -CA "${CERTS_DIR}/ca.crt" \
    -CAkey "${CERTS_DIR}/ca.key" \
    -CAcreateserial \
    -out "${CERTS_DIR}/server.crt" \
    -days ${DAYS} \
    -sha256 \
    -extensions v3_req \
    -extfile "${SCRIPT_DIR}/openssl.cnf" \
    2>/dev/null
echo "    ✓ Server certificate: ${CERTS_DIR}/server.crt"

# ── 4. Set restrictive permissions ────────────────────────
echo ""
echo "[4/4] Setting certificate permissions..."
chmod 600 "${CERTS_DIR}/server.key" "${CERTS_DIR}/ca.key"
chmod 644 "${CERTS_DIR}/server.crt" "${CERTS_DIR}/ca.crt"
echo "    ✓ Permissions set"

# ── Summary ───────────────────────────────────────────────
echo ""
echo "========================================"
echo " Certificates generated successfully!"
echo "========================================"
echo ""
echo " Files:"
echo "   CA Root:    ${CERTS_DIR}/ca.crt"
echo "   Server Key: ${CERTS_DIR}/server.key"
echo "   Server Cert:${CERTS_DIR}/server.crt"
echo ""
echo " Valid for: ${DAYS} days"
echo " SANs: localhost, voting.local, 127.0.0.1"
echo ""
echo " NEXT STEP: Start services with:"
echo "   docker compose up --build"
echo ""
echo " NOTE: Browser will show 'Not Secure' for self-signed"
echo "       certs. Import ca.crt into your OS trust store"
echo "       or use Let's Encrypt for production."
echo ""
