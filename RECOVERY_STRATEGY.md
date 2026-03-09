# Database Backup & Recovery Strategy

This document outlines the operational procedures for managing backups and recovering the Secure Electronic Voting System database.

## 1. Backup Process

### Automated Backups
Backups are performed using the `pg_dump` utility. A shell script is provided to automate this:
- **Script**: `devops/scripts/backup_database.sh`
- **Storage**: Backups are stored in the `/backups` directory (or `/app/backups` inside the container).
- **Format**: SQL plain text with the naming convention `backup_YYYY_MM_DD_HHMMSS.sql`.

### Manual Backup
Admins can trigger a manual backup via the API:
- **Endpoint**: `POST /api/admin/backup`
- **Requirement**: Must be authenticated as an Admin.

### Scheduling
To run daily backups, add a cron job on the host machine or within the container:
```bash
# Example cron: Daily at 2:00 AM
0 2 * * * /bin/bash /path/to/project/devops/scripts/backup_database.sh
```

## 2. Recovery Procedure

If data corruption or accidental deletion occurs, follow these steps:

1. **Identify the latest valid backup** in the `/backups` folder.
2. **Run the restore script**:
   ```bash
   bash devops/scripts/restore_database.sh /backups/backup_2026_03_10_020000.sql
   ```
   > [!WARNING]
   > The restore script will **drop and recreate** the `public` schema. All current data in the database will be replaced by the contents of the backup file.

## 3. Data Integrity Verification

After a restore:
1. Log into the system as an Admin.
2. Navigate to the Election Dashboard to verify elections and candidates are visible.
3. Check the `system_logs` for the `RECOVERY_PERFORMED` entry (if logged).
4. Run the Security Audit via the UI (US4.5) to ensure ballot integrity signatures still match.

## 4. Troubleshooting

- **Permissions**: Ensure the script has execute permissions: `chmod +x devops/scripts/*.sh`.
- **Space**: Monitor the storage space in the `/backups` directory.
- **Connection**: Ensure `DATABASE_URL` or discrete DB environment variables are correctly set in the environment where the script runs.
