import { Router, Response } from "express";
import { openDB } from "../db";
import { verifyVoterJWT } from "../middleware/auth";
import * as cryptoUtils from "../utils/crypto";
import crypto from "crypto";

const router = Router();

/**
 * US 4.1: Get elections specific to the logged-in voter
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
 * US 6.1, 6.2, 5.1: High-Integrity Voting Logic
 */
router.post("/cast-vote", verifyVoterJWT, async (req: any, res: Response) => {
  const { electionId, vote, encryptionKey } = req.body;
  const userIdHash = req.user.userId; // Corrected from userIdHash for consistency

  if (!electionId || !vote || !encryptionKey) {
    return res.status(400).json({ success: false, message: "Missing election, vote, or key." });
  }

  const db = await openDB();

  try {
    // 1. Check Election Status and Timeline (US 3.6)
    const election = await db.get(
      "SELECT status, start_time, end_time FROM elections WHERE election_id = ?",
      [electionId]
    );

    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found." });
    }

    const now = Math.floor(Date.now() / 1000);
    if (election.status !== 'ACTIVE' || now < election.start_time || now > election.end_time) {
      return res.status(403).json({ success: false, message: "Election is not currently active." });
    }

    // 2. Check Voter Eligibility (US 3.4)
    const voterRecord = await db.get(
      "SELECT has_voted FROM election_voters WHERE election_id = ? AND user_id_hash = ?",
      [electionId, userIdHash]
    );

    if (!voterRecord || voterRecord.has_voted === 1) {
      return res.status(403).json({ success: false, message: "Ineligible or already voted." });
    }

    // --- Start Transaction ---
    await db.run("BEGIN TRANSACTION");

    // 3. Encrypt and Hash (US 2.3 & 2.4)
    const encryptedVote = cryptoUtils.encryptVote(vote, encryptionKey);
    const voteHash = cryptoUtils.hashData(encryptedVote);
    const voteId = crypto.randomUUID();
    const timestamp = Date.now();
    const receiptHash = cryptoUtils.generateReceipt(voteId, userIdHash);

    // 4. US 6.2: Generate Integrity Signature (The "Seal")
    // This makes the database row immutable and verifiable.
    const integritySignature = cryptoUtils.generateIntegritySignature(
        voteId, 
        electionId, 
        encryptedVote, 
        timestamp
    );

    // 5. Save to 'votes' table with the Signature
    await db.run(
      `INSERT INTO votes (vote_id, election_id, encrypted_vote, vote_hash, timestamp, receipt_hash, integrity_signature) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [voteId, electionId, encryptedVote, voteHash, timestamp, receiptHash, integritySignature]
    );

    // 6. Mark as voted (US 3.4)
    await db.run(
      "UPDATE election_voters SET has_voted = 1 WHERE election_id = ? AND user_id_hash = ?",
      [electionId, userIdHash]
    );

    await db.run("COMMIT");

    res.json({
      success: true,
      receipt: receiptHash,
      message: "Your anonymous encrypted vote has been cast and sealed."
    });

  } catch (error: any) {
    if (db) await db.run("ROLLBACK");
    console.error("❌ Voting Error:", error.message);
    res.status(500).json({ success: false, message: "Security error or Database failure." });
  }
});

export default router;