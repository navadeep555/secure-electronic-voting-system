import { Router, Response } from "express";
import { openDB } from "../db";
import { verifyVoterJWT } from "../middleware/auth";
import * as crypto from "crypto";

const router = Router();

/**
 * US3.2: Get elections specific to the logged-in voter
 * Returns only ACTIVE elections where the user is on the guest list.
 */
router.get("/my-elections", verifyVoterJWT, async (req: any, res: Response) => {
  const db = await openDB();
  const userIdHash = req.user.userId;

  try {
    const availableElections = await db.all(
      `SELECT e.election_id, e.title, e.description, e.start_time, e.end_time 
       FROM elections e
       JOIN election_voters ev ON e.election_id = ev.election_id
       WHERE ev.user_id_hash = ? AND e.status = 'ACTIVE' AND ev.has_voted = 0`,
      [userIdHash]
    );

    res.json({ success: true, elections: availableElections });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch elections." });
  }
});

/**
 * US3.2, US3.4, US3.6: Enhanced Voting Logic
 */
router.post("/cast-vote", verifyVoterJWT, async (req: any, res: Response) => {
  const { electionId, vote, encryptionKey } = req.body;
  const userIdHash = req.user.userIdHash;

  if (!electionId || !vote || !encryptionKey) {
    return res.status(400).json({ success: false, message: "Missing election, vote, or key." });
  }

  const db = await openDB();

  try {
    // 1. [US3.2 & US3.6] Check Election Status and Timeline
    const election = await db.get(
      "SELECT status, start_time, end_time FROM elections WHERE election_id = ?",
      [electionId]
    );

    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found." });
    }

    const now = Math.floor(Date.now() / 1000);

    // Block if not ACTIVE (US3.6)
    if (election.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: `Election is currently ${election.status}.` });
    }

    // Block if outside time window (US3.2)
    if (now < election.start_time) {
      return res.status(403).json({ success: false, message: "Election has not started yet." });
    }
    if (now > election.end_time) {
      return res.status(403).json({ success: false, message: "Election has ended." });
    }

    // 2. [US3.4] Check Voter Eligibility for THIS specific election
    const voterRecord = await db.get(
      "SELECT has_voted FROM election_voters WHERE election_id = ? AND user_id_hash = ?",
      [electionId, userIdHash]
    );

    if (!voterRecord) {
      return res.status(403).json({ success: false, message: "You are not eligible for this election." });
    }

    if (voterRecord.has_voted === 1) {
      return res.status(403).json({ success: false, message: "Vote already cast for this election." });
    }

    // Start Transaction
    await db.run("BEGIN TRANSACTION");

    // 3. [US2.3] Encryption Logic
    // Using Buffer.alloc(32, encryptionKey) ensures the key is exactly 32 bytes for AES-256
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.alloc(32, encryptionKey), Buffer.alloc(16, 0));
    let encryptedVote = cipher.update(vote, "utf8", "hex");
    encryptedVote += cipher.final("hex");

    const voteHash = crypto.createHash("sha256").update(encryptedVote).digest("hex");
    
    // US2.5: Receipt Hash (Anonymized but verifiable proof of vote)
    const receiptHash = crypto.createHash("sha256")
      .update(userIdHash + electionId + Date.now().toString())
      .digest("hex");

    // 4. Save to 'votes' table
    await db.run(
      `INSERT INTO votes (id, encrypted_vote, vote_hash, timestamp, receipt_hash, election_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), encryptedVote, voteHash, Date.now(), receiptHash, electionId]
    );

    // 5. [US3.4] Mark as voted in THIS election only
    await db.run(
      "UPDATE election_voters SET has_voted = 1 WHERE election_id = ? AND user_id_hash = ?",
      [electionId, userIdHash]
    );

    await db.run("COMMIT");

    res.json({
      success: true,
      receipt: receiptHash,
      message: "Your anonymous encrypted vote has been cast."
    });

  } catch (error: any) {
    if (db) await db.run("ROLLBACK");
    console.error("❌ Voting Error:", error.message);
    res.status(500).json({ success: false, message: "Database error during voting." });
  }
});

export default router;