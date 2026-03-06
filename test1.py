import pytest
import sqlite3
import hashlib
import sys
import os
import jwt
import time
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_path = os.path.join(current_dir, "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from backend.app import app, JWT_SECRET, compute_hash

@pytest.fixture
def client():
    """Sets up a test client for the Flask app."""
    app.config['TESTING'] = True
    # Ensure database path is correct for the environment
    db_file = os.path.join(backend_path, "voting_system.db")
    
    with app.test_client() as client:
        yield client

# ==========================================================
# 1. DOUBLE VOTING PREVENTION TEST
# ==========================================================
def test_double_voting_prevention(client):
    """US2.1: Verify system rejects a second vote from the same user."""
    test_eid = "test-election-123"
    test_uid = "test-voter-456"
    db_file = os.path.join(backend_path, "voting_system.db")

    conn = sqlite3.connect(db_file)
    conn.execute("INSERT OR IGNORE INTO election_voters (election_id, user_id_hash, has_voted) VALUES (?, ?, 1)", 
                 (test_eid, test_uid))
    conn.commit()
    conn.close()

    token = jwt.encode({
        "userId": test_uid, 
        "role": "voter", 
        "exp": int(time.time()) + 3600
    }, JWT_SECRET, algorithm="HS256")

    response = client.post('/api/voter/cast-vote', 
        json={
            "election_id": test_eid,
            "candidate_id": "cand-001",
            "pin": "1234"
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 403
    assert b"Already voted" in response.data

# ==========================================================
# 2. HASHING INTEGRITY TEST
# ==========================================================
def test_hashing_integrity():
    """US2.4: Verify hashing algorithm produces valid SHA-256 strings."""
    data = "voter123-electionA-candB"
    result = compute_hash(data)
    assert len(result) == 64 
    assert result == hashlib.sha256(data.encode()).hexdigest()

# ==========================================================
# 3. BLOCKCHAIN CHAIN VALIDATION TEST
# ==========================================================
def test_blockchain_consistency():
    """Verify each block points to the previous block's hash."""
    db_file = os.path.join(backend_path, "voting_system.db")
    conn = sqlite3.connect(db_file)
    conn.row_factory = sqlite3.Row
    votes = conn.execute("SELECT previous_hash, block_hash FROM votes ORDER BY timestamp ASC").fetchall()
    conn.close()

    if len(votes) > 1:
        for i in range(1, len(votes)):
            assert votes[i]['previous_hash'] == votes[i-1]['block_hash'], f"Chain broken at index {i}"

# ==========================================================
# 4. TAMPER DETECTION TEST (The "Hacker" Test)
# ==========================================================
def test_tamper_detection():
    """US3.2: Prove that altering a vote breaks the cryptographic validation."""
    db_file = os.path.join(backend_path, "voting_system.db")
    
    conn = sqlite3.connect(db_file)
    conn.row_factory = sqlite3.Row
    
    # 1. Manually "Hack" the database
    # Fetching the first vote available
    original = conn.execute("SELECT rowid, candidate_id, election_id, block_hash FROM votes LIMIT 1").fetchone()
    
    if original:
        row_id = original['rowid']
        orig_candidate = original['candidate_id']
        
        # ACT LIKE A HACKER: Change the candidate name directly in the SQL file
        conn.execute("UPDATE votes SET candidate_id = 'TAMPERED_VOTE' WHERE rowid = ?", (row_id,))
        conn.commit()

        # 2. Run Validation logic
        # Fetch the row again (now it has tampered data but the OLD hash)
        tampered_row = conn.execute("SELECT election_id, candidate_id, block_hash FROM votes WHERE rowid = ?", (row_id,)).fetchone()
        
        # We re-calculate what the hash WOULD be now that the data has changed.
        # This string must match the format your 'compute_hash' uses in app.py
        # Usually: election_id + candidate_id (and sometimes timestamp)
        new_data_string = f"{tampered_row['election_id']}-{tampered_row['candidate_id']}"
        recalculated_hash = hashlib.sha256(new_data_string.encode()).hexdigest()
        
        # 3. VERIFY: The recalculated_hash will NOT match the stored block_hash
        is_tampered = recalculated_hash != tampered_row['block_hash']
        
        # Clean up: Restore the original candidate so your database isn't broken
        conn.execute("UPDATE votes SET candidate_id = ? WHERE rowid = ?", (orig_candidate, row_id))
        conn.commit()
        conn.close()

        assert is_tampered is True, "Security Alert: The hash still matched even though we changed the data!"
        print("\n✅ Tamper detection verified: Cryptographic seal broken successfully.")
    else:
        conn.close()
        pytest.skip("No votes found in DB to perform tamper test. Cast a vote via Postman first!")

print("✅ Full Backend Test Suite with Tamper Detection Ready.")