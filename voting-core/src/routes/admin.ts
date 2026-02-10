import { Router, Response, Request } from "express";
import { openDB } from "../db";
import { authorize } from "../middleware/auth";
import * as crypto from "crypto";

const router = Router();

/**
 * Helper: Decrypts the vote
 */
function decryptVote(encryptedVote: string, key: string): string {
  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.alloc(32, key),
      Buffer.alloc(16, 0)
    );
    let decrypted = decipher.update(encryptedVote, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Decryption failed:", err);
    return "INVALID_VOTE";
  }
}

/**
 * GET /elections
 */
router.get("/elections", authorize(["admin"]), async (req: Request, res: Response) => {
  try {
    const db = await openDB();
    const elections = await db.all(`
      SELECT e.*, 
      (SELECT COUNT(*) FROM candidates c WHERE c.election_id = e.election_id) as candidate_count
      FROM elections e
      ORDER BY e.created_at DESC
    `);
    res.json(elections);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch elections." });
  }
});

/**
 * Create Election and Add Candidates
 */
router.post("/setup-election", authorize(["admin"]), async (req: any, res: Response) => {
  const { title, description, start_time, end_time, candidates } = req.body;
  const db = await openDB();

  try {
    await db.run("BEGIN TRANSACTION");
    const electionId = crypto.randomUUID();

    await db.run(
      `INSERT INTO elections (election_id, title, description, start_time, end_time, status, created_by, created_at) 
       VALUES (?, ?, ?, ?, ?, 'DRAFT', ?, ?)`,
      [electionId, title, description, start_time, end_time, req.user.userId, Date.now()]
    );

    if (candidates && Array.isArray(candidates)) {
      for (const cand of candidates) {
        await db.run(
          `INSERT INTO candidates (candidate_id, election_id, name, party) VALUES (?, ?, ?, ?)`,
          [crypto.randomUUID(), electionId, cand.name, cand.party]
        );
      }
    }

    await db.run("COMMIT");
    res.json({ success: true, electionId, message: "Election created as DRAFT." });
  } catch (error) {
    await db.run("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Failed to initialize election." });
  }
});

/**
 * Update Candidate with Integrity Lock
 */
router.patch("/update-candidate/:candidateId", authorize(["admin"]), async (req, res) => {
  const { candidateId } = req.params;
  const { name, party } = req.body;
  const db = await openDB();

  const election = await db.get(
    `SELECT e.status FROM elections e 
     JOIN candidates c ON e.election_id = c.election_id 
     WHERE c.candidate_id = ?`,
    [candidateId]
  );

  if (election && election.status !== 'DRAFT') {
    return res.status(403).json({
      success: false,
      message: `Integrity Lock: Cannot modify candidates when election is ${election.status}.`
    });
  }

  await db.run(
    "UPDATE candidates SET name = ?, party = ? WHERE candidate_id = ?",
    [name, party, candidateId]
  );

  res.json({ success: true, message: "Candidate updated successfully." });
});

/**
 * Register Voters (Guest List)
 */
router.post("/register-voters", authorize(["admin"]), async (req: any, res: Response) => {
  const { electionId, voterHashes } = req.body;
  const db = await openDB();

  if (!electionId || !voterHashes) {
    return res.status(400).json({ error: "Missing electionId or voter list." });
  }

  try {
    await db.run("BEGIN TRANSACTION");
    for (const hash of voterHashes) {
      await db.run(
        "INSERT OR IGNORE INTO election_voters (election_id, user_id_hash, has_voted) VALUES (?, ?, 0)",
        [electionId, hash]
      );
    }
    await db.run("COMMIT");
    res.json({ success: true, message: `${voterHashes.length} voters added.` });
  } catch (error) {
    await db.run("ROLLBACK");
    res.status(500).json({ error: "Failed to upload voter list." });
  }
});

/**
 * --- NEW: Auto-register a single voter to all ACTIVE elections ---
 */
router.post("/register-voter-auto", authorize(["admin"]), async (req, res) => {
  const { userIdHash } = req.body;
  const db = await openDB();

  const activeElections = await db.all(
    "SELECT election_id FROM elections WHERE status='ACTIVE'"
  );

  try {
    await db.run("BEGIN TRANSACTION");
    for (const e of activeElections) {
      await db.run(
        "INSERT OR IGNORE INTO election_voters (election_id, user_id_hash, has_voted) VALUES (?, ?, 0)",
        [e.election_id, userIdHash]
      );
    }
    await db.run("COMMIT");
    res.json({ success: true, message: "User registered to all active elections" });
  } catch (err) {
    await db.run("ROLLBACK");
    res.status(500).json({ error: "Failed to register voter" });
  }
});

/**
 * Update Status (Active/Paused/Closed)
 */
router.patch("/election-status", authorize(["admin"]), async (req: any, res: Response) => {
  const { electionId, status } = req.body;
  const db = await openDB();

  try {
    await db.run("UPDATE elections SET status = ? WHERE election_id = ?", [status.toUpperCase(), electionId]);
    res.json({ success: true, message: `Election status updated to ${status}.` });
  } catch (error) {
    res.status(500).json({ error: "Failed to update status." });
  }
});

/**
 * Final Tally (Decrypt and Count)
 */
router.get("/tally/:electionId", authorize(["admin"]), async (req: any, res: Response) => {
  const { electionId } = req.params;
  const { decryptionKey } = req.query;
  const db = await openDB();

  const election = await db.get("SELECT status FROM elections WHERE election_id = ?", [electionId]);

  if (!election || election.status !== 'CLOSED') {
    return res.status(403).json({ message: "Tallying is only allowed for CLOSED elections." });
  }

  const votes = await db.all("SELECT encrypted_vote FROM votes WHERE election_id = ?", [electionId]);
  const candidates = await db.all("SELECT name, party FROM candidates WHERE election_id = ?", [electionId]);

  const tally: Record<string, number> = {};
  candidates.forEach(c => tally[c.name] = 0);

  votes.forEach(v => {
    const choice = decryptVote(v.encrypted_vote, decryptionKey as string);
    if (tally[choice] !== undefined) tally[choice]++;
  });

  const formattedResults = candidates.map(c => ({
    candidate_name: c.name,
    party: c.party,
    vote_count: tally[c.name]
  }));

  res.json({ success: true, results: formattedResults });
});

/**
 * Add Candidate
 */
router.post("/add-candidate", authorize(["admin"]), async (req, res) => {
  const { electionId, name, party } = req.body;
  const db = await openDB();

  const election = await db.get("SELECT status FROM elections WHERE election_id = ?", [electionId]);
  if (election.status !== 'DRAFT') {
    return res.status(403).json({ error: "Cannot add candidates to an active/closed election." });
  }

  await db.run(
    "INSERT INTO candidates (candidate_id, election_id, name, party) VALUES (?, ?, ?, ?)",
    [crypto.randomUUID(), electionId, name, party]
  );
  res.json({ success: true });
});

export default router;
