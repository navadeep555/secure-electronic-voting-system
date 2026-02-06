import { Router, Request, Response } from "express";
import { openDB } from "../db";
import { verifyVoterJWT } from "../middleware/auth"; // Ensure this middleware exists
import * as crypto from "crypto";

const router = Router();

/**
 * US2.3, US2.4, US2.6: The core voting logic.
 * Encrypts the vote, generates a hash, and marks the user as 'voted'.
 */
router.post("/cast-vote", verifyVoterJWT, async (req: any, res: Response) => {
  const { vote, encryptionKey } = req.body;
  
  // The userId is extracted from the JWT by the authenticateVoter middleware
  const userIdHash = req.user.userId; 

  if (!vote || !encryptionKey || !userIdHash) {
    return res.status(400).json({ success: false, message: "Missing voting data or identity." });
  }

  const db = await openDB();

  try {
    // Start Transaction: Ensure we don't record a vote without marking the user as voted
    await db.run("BEGIN TRANSACTION");

    // 1. [US2.3] Encrypt the vote using the user's PIN as a salt/key
    // We'll use a standard AES-256-CBC or a simple HMAC/Cipher for this example
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.alloc(32, encryptionKey), Buffer.alloc(16, 0));
    let encryptedVote = cipher.update(vote, "utf8", "hex");
    encryptedVote += cipher.final("hex");

    // 2. [US2.4] Generate a SHA-256 Hash for Integrity
    const voteHash = crypto.createHash("sha256").update(encryptedVote).digest("hex");

    // 3. [US2.5] Create a Receipt ID (Anonymous unique identifier)
    const receiptHash = crypto.createHash("sha256").update(userIdHash + Date.now()).digest("hex");

    // 4. Save to 'votes' table
    await db.run(
  `INSERT INTO votes (id, encrypted_vote, vote_hash, timestamp, receipt_hash) 
   VALUES (?, ?, ?, ?, ?)`,
  [
    crypto.randomUUID(),    // Matches 'id'
    encryptedVote,          // Matches 'encrypted_vote'
    voteHash,               // Matches 'vote_hash'
    Date.now(),             // Matches 'timestamp'
    receiptHash             // Matches 'receipt_hash'
  ]
);

    // 5. [US2.6] Mark the user as having voted in the shared database
    const updateResult = await db.run(
      "UPDATE users SET has_voted = 1 WHERE user_id_hash = ?",
      [userIdHash]
    );

    if (updateResult.changes === 0) {
      throw new Error("Failed to update user status - User ID not found.");
    }

    // Commit everything
    await db.run("COMMIT");

    console.log(`✅ Vote recorded and user ${userIdHash.substring(0,8)}... marked as voted.`);

    res.json({
      success: true,
      receipt: receiptHash,
      message: "Your anonymous encrypted vote has been cast."
    });

  } catch (error: any) {
    await db.run("ROLLBACK");
    console.error("❌ Voting Error:", error.message);
    res.status(500).json({ success: false, message: "Database error during voting." });
  }
});

export default router;