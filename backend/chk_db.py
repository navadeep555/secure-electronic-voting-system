import requests
import time
import os

# --- CONFIGURATION ---
# Ensure this matches your Flask app's port
BASE_URL = "http://127.0.0.1:5001/api" 
ADMIN_CREDENTIALS = {"username": "admin", "password": "admin123"}
VOTER_HASH = "VOTER_TEST_999" 

def run_comprehensive_test():
    print("🚀 Starting Full Integration Test (Epics 1-5)...")

    # 1. ADMIN LOGIN
    try:
        admin_auth = requests.post(f"{BASE_URL}/admin/login", json=ADMIN_CREDENTIALS).json()
        admin_headers = {"Authorization": f"Bearer {admin_auth['token']}"}
        print("✅ Admin Authenticated")
    except Exception as e:
        print(f"❌ Admin Login Failed: {e}")
        return

    # 2. CREATE ELECTION (DRAFT)
    # We set a very short 10-second window to test auto-close logic
    now = int(time.time())
    election_data = {
        "title": "Final Audit Verification",
        "description": "Testing Chained Ledger & PDF Generation",
        "start_time": now,
        "end_time": now + 10  
    }
    e_res = requests.post(f"{BASE_URL}/admin/setup-election", json=election_data, headers=admin_headers).json()
    eid = e_res['election_id']
    print(f"✅ Election Created: {eid}")

    # 3. CONFIGURE ELECTION
    # Add mandatory candidates and whitelist the voter
    requests.post(f"{BASE_URL}/admin/add-candidate", 
                  json={"electionId": eid, "name": "Candidate Alpha", "party": "Security Party"}, 
                  headers=admin_headers)
    requests.post(f"{BASE_URL}/admin/add-candidate", 
                  json={"electionId": eid, "name": "Candidate Beta", "party": "Integrity Party"}, 
                  headers=admin_headers)
    
    requests.post(f"{BASE_URL}/admin/register-voters", 
                  json={"electionId": eid, "voterHashes": [VOTER_HASH]}, 
                  headers=admin_headers)

    # Activate the election
    requests.patch(f"{BASE_URL}/admin/election-status", 
                   json={"electionId": eid, "status": "ACTIVE"}, 
                   headers=admin_headers)
    print("✅ Election Activated")

    # 4. VOTER LOGIN (BYPASS)
    login_res = requests.post(f"{BASE_URL}/recognize-face", json={
        "userId": VOTER_HASH,
        "faceImage": "BYPASS_FOR_TESTING"
    }).json()
    voter_headers = {"Authorization": f"Bearer {login_res['token']}"}
    print(f"✅ Voter {VOTER_HASH} Logged In")

    # 5. CAST VOTE
    # Get the ID of Candidate Alpha
    cands = requests.get(f"{BASE_URL}/voter/elections/{eid}/candidates", headers=voter_headers).json()
    cid = cands[0]['candidate_id']
    
    vote_res = requests.post(f"{BASE_URL}/voter/cast-vote", json={
        "election_id": eid,
        "candidate_id": cid,
        "pin": "1234"
    }, headers=voter_headers).json()
    
    if vote_res.get('success'):
        print(f"✅ Vote Cast. Receipt: {vote_res['receipt']}")
    else:
        print(f"❌ Vote Failed: {vote_res.get('message')}")
        return

    # 6. WAIT FOR AUTO-CLOSE
    # We wait past the 10-second mark so the election moves to CLOSED
    print("⏳ Waiting 12s for election to expire...")
    time.sleep(12)
    
    # Trigger the before_request auto-close logic
    requests.get(f"{BASE_URL}/elections")

    # 7. GENERATE PDF REPORT
    # CRITICAL: Path is /admin/election/<eid>/report/pdf (BASE_URL already has /api)
    print("📄 Requesting PDF Audit Certificate...")
    pdf_url = f"{BASE_URL}/admin/election/{eid}/report/pdf"
    pdf_res = requests.get(pdf_url, headers=admin_headers)

    if pdf_res.status_code == 200:
        if pdf_res.headers.get('Content-Type') == 'application/pdf':
            filename = f"Audit_Certificate_{eid[:8]}.pdf"
            with open(filename, "wb") as f:
                f.write(pdf_res.content)
            print(f"🎊 SUCCESS! Report saved: {os.path.abspath(filename)}")
        else:
            print(f"❌ Error: Not a PDF. Type: {pdf_res.headers.get('Content-Type')}")
    else:
        print(f"❌ PDF Failed: {pdf_res.status_code}")
        print(f"Debug Info: {pdf_res.text}")

if __name__ == "__main__":
    run_comprehensive_test()