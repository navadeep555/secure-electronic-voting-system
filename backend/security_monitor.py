import time
from datetime import datetime
import os

# Thresholds for threats
FAILED_LOGIN_LIMIT = 5
FAILED_LOGIN_WINDOW = 300  # 5 minutes in seconds

def log_system_event(conn, event_type, details, source_ip=None, admin_id=None):
    """Logs runtime monitoring events to system_logs."""
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO system_logs (event_type, details, admin_id)
        VALUES (%s, %s, %s)
    """, (event_type, f"[{source_ip or 'INTERNAL'}] {details}", admin_id))
    conn.commit()
    print(f"EVENT LOGGED: {event_type} - {details}")

def log_security_alert(conn, event_type, details, affected_table=None):
    """Logs critical security incidents to audit_log and system_logs, prints to console."""
    cur = conn.cursor()

    # Log to audit_log — uses 'new_value' to store the alert description
    # (audit_log schema: action, table_name, row_id, old_value, new_value, created_at)
    cur.execute("""
        INSERT INTO audit_log (action, table_name, new_value)
        VALUES (%s, %s, %s)
    """, (event_type, affected_table or 'N/A', details))

    # Log to system_logs as well
    cur.execute("""
        INSERT INTO system_logs (event_type, details)
        VALUES (%s, %s)
    """, (f"ALERT_{event_type}", details))

    conn.commit()
    print(f"\nSECURITY ALERT: {event_type} - {details}\n")

def detect_bruteforce(conn, source_ip):
    """Checks for 5 failed logins within 5 minutes from the same IP."""
    cur = conn.cursor()
    cur.execute("""
        SELECT COUNT(*) FROM system_logs 
        WHERE event_type = 'LOGIN_FAILURE' 
        AND details LIKE %s 
        AND timestamp > NOW() - INTERVAL '5 minutes'
    """, (f"[{source_ip}]%",))
    count = cur.fetchone()[0]
    return count >= FAILED_LOGIN_LIMIT

def get_threat_level(conn):
    """Computes current threat level based on recent logs."""
    cur = conn.cursor()

    # Check for critical alerts (tampering) in audit_log
    cur.execute("""
        SELECT COUNT(*) FROM audit_log 
        WHERE (action = 'TAMPERING_DETECTED' OR action = 'UNAUTHORIZED_UPDATE_ATTEMPT'
               OR action = 'DUPLICATE_VOTE_ATTEMPT' OR action = 'BRUTE_FORCE_ATTEMPT')
        AND created_at > NOW() - INTERVAL '4 hours'
    """)
    tampering_alerts = cur.fetchone()[0]

    # Count all failed/suspicious events from system_logs in last 30 minutes
    cur.execute("""
        SELECT COUNT(*) FROM system_logs 
        WHERE event_type IN ('LOGIN_FAILURE', 'OTP_FAILURE', 'UNAUTHORIZED_ACCESS',
                             'ALERT_BRUTE_FORCE_ATTEMPT', 'ALERT_DUPLICATE_VOTE_ATTEMPT')
        AND timestamp > NOW() - INTERVAL '30 minutes'
    """)
    recent_suspicious = cur.fetchone()[0]

    if tampering_alerts > 0 or recent_suspicious > 10:
        return "high"
    elif recent_suspicious >= 3:
        return "medium"
    else:
        return "low"

def get_recent_security_events(conn, limit=10):
    """Fetches recent items from system_logs and audit_log."""
    cur = conn.cursor()
    # audit_log uses 'new_value' column to store the alert description
    cur.execute("""
        (SELECT event_type AS type, details AS info, timestamp AS time FROM system_logs)
        UNION ALL
        (SELECT action AS type, new_value AS info, created_at AS time FROM audit_log)
        ORDER BY time DESC
        LIMIT %s
    """, (limit,))
    rows = cur.fetchall()
    events = []
    for row in rows:
        events.append({
            "event_type": row[0],
            "description": row[1],
            "timestamp": row[2].isoformat() if hasattr(row[2], 'isoformat') else str(row[2])
        })
    return events
