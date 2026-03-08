#!/usr/bin/env bash
# ==============================================================
# check-cert-expiry.sh – TLS Certificate Expiration Monitor
# Secure Electronic Voting System – EPIC 6 US6.3
#
# Usage (manual):
#   bash devops/scripts/check-cert-expiry.sh
#
# Usage (cron – daily at 9am):
#   0 9 * * * /path/to/devops/scripts/check-cert-expiry.sh
#
# Exits with:
#   0 – Certificate valid and not expiring soon
#   1 – Certificate expiring soon (< WARN_DAYS) or already expired
# ==============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERT_FILE="${SCRIPT_DIR}/../ssl/certs/server.crt"
WARN_DAYS=30      # Warn when < 30 days to expiry
CRITICAL_DAYS=7   # Critical when < 7 days to expiry

BOLD="\033[1m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
GREEN="\033[0;32m"
RESET="\033[0m"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " TLS Certificate Expiry Monitor"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if openssl is available
if ! command -v openssl &>/dev/null; then
    echo -e "${RED}[ERROR] openssl not installed${RESET}"
    exit 1
fi

# Check if cert file exists
if [[ ! -f "${CERT_FILE}" ]]; then
    echo -e "${RED}[ERROR] Certificate not found: ${CERT_FILE}${RESET}"
    echo "  Run: bash devops/ssl/gen-certs.sh"
    exit 1
fi

# Get expiry date in epoch seconds
EXPIRY_DATE=$(openssl x509 -enddate -noout -in "${CERT_FILE}" | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "${EXPIRY_DATE}" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "${EXPIRY_DATE}" +%s)
NOW_EPOCH=$(date +%s)
DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))

# Cert subject info
SUBJECT=$(openssl x509 -subject -noout -in "${CERT_FILE}" | sed 's/subject=//')
ISSUER=$(openssl x509 -issuer -noout -in "${CERT_FILE}" | sed 's/issuer=//')

echo ""
echo " Certificate: ${CERT_FILE}"
echo " Subject:     ${SUBJECT}"
echo " Issuer:      ${ISSUER}"
echo " Expires:     ${EXPIRY_DATE}"
echo " Days Left:   ${DAYS_LEFT}"
echo ""

if [[ ${DAYS_LEFT} -le 0 ]]; then
    echo -e "${BOLD}${RED}[CRITICAL] Certificate has EXPIRED!${RESET}"
    echo "  → Renew immediately: bash devops/ssl/gen-certs.sh"
    echo "  → Or use Let's Encrypt: certbot renew --config devops/config/letsencrypt.ini"
    exit 1
elif [[ ${DAYS_LEFT} -le ${CRITICAL_DAYS} ]]; then
    echo -e "${BOLD}${RED}[CRITICAL] Certificate expires in ${DAYS_LEFT} days!${RESET}"
    echo "  → Renew now: bash devops/ssl/gen-certs.sh"
    exit 1
elif [[ ${DAYS_LEFT} -le ${WARN_DAYS} ]]; then
    echo -e "${YELLOW}[WARNING] Certificate expires in ${DAYS_LEFT} days.${RESET}"
    echo "  → Plan renewal soon: bash devops/ssl/gen-certs.sh"
    exit 1
else
    echo -e "${GREEN}[OK] Certificate is valid for ${DAYS_LEFT} more days.${RESET}"
    exit 0
fi
