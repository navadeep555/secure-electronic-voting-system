# ============================================================
# gen-certs.ps1 – Generate self-signed TLS certificates (Windows)
# Usage: powershell -ExecutionPolicy Bypass -File devops\ssl\gen-certs.ps1
# ============================================================

$ErrorActionPreference = "Stop"

$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$CertsDir   = Join-Path $ScriptDir "certs"
$OpensslCnf = Join-Path $ScriptDir "openssl.cnf"
$Days       = 365

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Secure Voting System - TLS Certificate " -ForegroundColor Cyan
Write-Host " Generator (Self-Signed / Development)  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Create certs directory
New-Item -ItemType Directory -Force -Path $CertsDir | Out-Null

# ── Method 1: OpenSSL (preferred, if installed) ────────────
$OpenSSL = Get-Command openssl -ErrorAction SilentlyContinue
if ($OpenSSL) {
    Write-Host "`n[INFO] OpenSSL found. Generating with OpenSSL..." -ForegroundColor Green

    # CA key + cert
    Write-Host "[1/4] Generating CA root certificate..."
    & openssl genrsa -out "$CertsDir\ca.key" 4096 2>$null
    & openssl req -new -x509 -days $Days `
        -key "$CertsDir\ca.key" `
        -out "$CertsDir\ca.crt" `
        -subj "/C=IN/ST=Telangana/L=Hyderabad/O=Voting System CA/CN=VotingCA" 2>$null

    # Server key + CSR
    Write-Host "[2/4] Generating server key and CSR..."
    & openssl genrsa -out "$CertsDir\server.key" 2048 2>$null
    & openssl req -new `
        -key "$CertsDir\server.key" `
        -out "$CertsDir\server.csr" `
        -config $OpensslCnf 2>$null

    # Sign server cert
    Write-Host "[3/4] Signing server certificate..."
    & openssl x509 -req `
        -in "$CertsDir\server.csr" `
        -CA "$CertsDir\ca.crt" `
        -CAkey "$CertsDir\ca.key" `
        -CAcreateserial `
        -out "$CertsDir\server.crt" `
        -days $Days -sha256 `
        -extensions v3_req `
        -extfile $OpensslCnf 2>$null

    Write-Host "[4/4] Done!" -ForegroundColor Green
}
else {
    # ── Method 2: PowerShell built-in (fallback) ───────────
    Write-Host "`n[INFO] OpenSSL not found. Using PowerShell New-SelfSignedCertificate..." -ForegroundColor Yellow

    $Cert = New-SelfSignedCertificate `
        -DnsName "localhost", "voting.local" `
        -IPAddress "127.0.0.1" `
        -CertStoreLocation "Cert:\LocalMachine\My" `
        -NotAfter (Get-Date).AddDays($Days) `
        -KeyAlgorithm RSA `
        -KeyLength 2048 `
        -HashAlgorithm SHA256 `
        -KeyExportPolicy Exportable `
        -Subject "CN=localhost, O=Secure Voting System, C=IN"

    # Export PFX then convert to PEM
    $PfxPath = Join-Path $CertsDir "server.pfx"
    $PfxPwd  = ConvertTo-SecureString -String "devpassword" -Force -AsPlainText
    Export-PfxCertificate -Cert $Cert -FilePath $PfxPath -Password $PfxPwd | Out-Null

    Write-Host "[OK] Certificate exported to: $PfxPath" -ForegroundColor Green
    Write-Host "[INFO] To use with Nginx, convert PFX to PEM:" -ForegroundColor Yellow
    Write-Host "       openssl pkcs12 -in server.pfx -nocerts -nodes -out server.key" -ForegroundColor Yellow
    Write-Host "       openssl pkcs12 -in server.pfx -clcerts -nokeys -out server.crt" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Certificate Generation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host " Files in: $CertsDir" -ForegroundColor White
Write-Host " Valid for: $Days days" -ForegroundColor White
Write-Host ""
Write-Host " Next: docker compose up --build" -ForegroundColor Cyan
