#!/bin/bash

# Configuration
BACKUP_DIR="/app/backups"
TIMESTAMP=$(date +"%Y_%m_%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "--- Starting Database Backup: ${TIMESTAMP} ---"

# Determine connection method
if [ -n "$DATABASE_URL" ]; then
    echo "Using DATABASE_URL for backup..."
    pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
else
    echo "Using discrete DB environment variables..."
    export PGPASSWORD="${DB_PASSWORD:-voting123}"
    pg_dump -h "${DB_HOST:-postgres}" \
            -p "${DB_PORT:-5432}" \
            -U "${DB_USER:-voting}" \
            -d "${DB_NAME:-votingdb}" > "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: ${BACKUP_FILE}"
    
    # Log to system_logs if possible (using psql)
    if [ -n "$DATABASE_URL" ]; then
        psql "$DATABASE_URL" -c "INSERT INTO system_logs (event_type, details) VALUES ('BACKUP_COMPLETED', 'Database backup saved to ${BACKUP_FILE}');"
    else
        psql -h "${DB_HOST:-postgres}" -p "${DB_PORT:-5432}" -U "${DB_USER:-voting}" -d "${DB_NAME:-votingdb}" \
             -c "INSERT INTO system_logs (event_type, details) VALUES ('BACKUP_COMPLETED', 'Database backup saved to ${BACKUP_FILE}');"
    fi
else
    echo "ERROR: Backup failed!"
    if [ -n "$DATABASE_URL" ]; then
        psql "$DATABASE_URL" -c "INSERT INTO system_logs (event_type, details) VALUES ('BACKUP_FAILED', 'Database backup failed at ${TIMESTAMP}');"
    else
        psql -h "${DB_HOST:-postgres}" -p "${DB_PORT:-5432}" -U "${DB_USER:-voting}" -d "${DB_NAME:-votingdb}" \
             -c "INSERT INTO system_logs (event_type, details) VALUES ('BACKUP_FAILED', 'Database backup failed at ${TIMESTAMP}');"
    fi
    exit 1
fi

echo "--- Backup Process Finished ---"
