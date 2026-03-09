#!/bin/bash

# Configuration
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 /path/to/backup_file.sql"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

echo "--- Starting Database Restore from: ${BACKUP_FILE} ---"

# Determine connection method
if [ -n "$DATABASE_URL" ]; then
    echo "Using DATABASE_URL for restore..."
    # Drop and recreate schema to ensure clean slate
    psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    psql "$DATABASE_URL" < "$BACKUP_FILE"
else
    echo "Using discrete DB environment variables..."
    export PGPASSWORD="${DB_PASSWORD:-voting123}"
    psql -h "${DB_HOST:-postgres}" \
         -p "${DB_PORT:-5432}" \
         -U "${DB_USER:-voting}" \
         -d "${DB_NAME:-votingdb}" \
         -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    
    psql -h "${DB_HOST:-postgres}" \
         -p "${DB_PORT:-5432}" \
         -U "${DB_USER:-voting}" \
         -d "${DB_NAME:-votingdb}" < "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
    echo "Restore completed successfully."
else
    echo "ERROR: Restore failed!"
    exit 1
fi

echo "--- Restore Process Finished ---"
