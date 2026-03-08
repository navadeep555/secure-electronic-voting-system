import { Router, Response, Request } from "express";
import { pool } from "../db";
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
    const { rows } = await pool.query(`
      SELECT e.*,
      (SELECT COUNT(*) FROM candidates c WHERE c.election_id = e.election_id) as candidate_count
      FROM elections e
      ORDER BY e.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch elections." });
  }
});

/**
 * Create Election and Add Candidates
 */
router.post("/setup-election", authorize(["admin"]), async (req: any, res: Response) => {
  const { title, description, start_time, end_time, candidates } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const electionId = crypto.randomUUID();

    await client.query(
      `INSERT INTO elections (election_id, title, description, start_time, end_time, status, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, 'DRAFT', $6, $7)`,
      [electionId, title, description, start_time, end_time, req.user.userId, Date.now()]
    );

    if (candidates && Array.isArray(candidates)) {
      for (const cand of candidates) {
        await client.query(
          `INSERT INTO candidates (candidate_id, election_id, name, party) VALUES ($1, $2, $3, $4)`,
          [crypto.randomUUID(), electionId, cand.name, cand.party]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ success: true, electionId, message: "Election created as DRAFT." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Failed to initialize election." });
  } finally {
    client.release();
  }
});

/**
 * Update Candidate with Integrity Lock
 */
router.patch("/update-candidate/:candidateId", authorize(["admin"]), async (req, res) => {
  const { candidateId } = req.params;
  const { name, party } = req.body;

  const electionRes = await pool.query(
    `SELECT e.status FROM elections e
     JOIN candidates c ON e.election_id = c.election_id
     WHERE c.candidate_id = $1`,
    [candidateId]
  );

  const election = electionRes.rows[0];
  if (election && election.status !== "DRAFT") {
    return res.status(403).json({
      success: false,
      message: `Integrity Lock: Cannot modify candidates when election is ${election.status}.`,
    });
  }

  await pool.query(
    "UPDATE candidates SET name = $1, party = $2 WHERE candidate_id = $3",
    [name, party, candidateId]
  );

  res.json({ success: true, message: "Candidate updated successfully." });
});

/**
 * Register Voters (Guest List)
 */
router.post("/register-voters", authorize(["admin"]), async (req: any, res: Response) => {
  const { electionId, voterHashes } = req.body;

  if (!electionId || !voterHashes) {
    return res.status(400).json({ error: "Missing electionId or voter list." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const hash of voterHashes) {
      await client.query(
        `INSERT INTO election_voters (election_id, user_id_hash, has_voted)
         VALUES ($1, $2, 0)
         ON CONFLICT (election_id, user_id_hash) DO NOTHING`,
        [electionId, hash]
      );
    }
    await client.query("COMMIT");
    res.json({ success: true, message: `${voterHashes.length} voters added.` });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Failed to upload voter list." });
  } finally {
    client.release();
  }
});

/**
 * Auto-register a single voter to all ACTIVE elections
 */
router.post("/register-voter-auto", authorize(["admin"]), async (req, res) => {
  const { userIdHash } = req.body;

  const { rows: activeElections } = await pool.query(
    "SELECT election_id FROM elections WHERE status='ACTIVE'"
  );

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const e of activeElections) {
      await client.query(
        `INSERT INTO election_voters (election_id, user_id_hash, has_voted)
         VALUES ($1, $2, 0)
         ON CONFLICT (election_id, user_id_hash) DO NOTHING`,
        [e.election_id, userIdHash]
      );
    }
    await client.query("COMMIT");
    res.json({ success: true, message: "User registered to all active elections" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Failed to register voter" });
  } finally {
    client.release();
  }
});

/**
 * Update Status (Active/Paused/Closed)
 */
router.patch("/election-status", authorize(["admin"]), async (req: any, res: Response) => {
  const { electionId, status } = req.body;

  try {
    await pool.query(
      "UPDATE elections SET status = $1 WHERE election_id = $2",
      [status.toUpperCase(), electionId]
    );
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

  const electionRes = await pool.query(
    "SELECT status FROM elections WHERE election_id = $1",
    [electionId]
  );

  const election = electionRes.rows[0];
  if (!election || election.status !== "CLOSED") {
    return res.status(403).json({ message: "Tallying is only allowed for CLOSED elections." });
  }

  const { rows: votes } = await pool.query(
    "SELECT encrypted_vote FROM votes WHERE election_id = $1",
    [electionId]
  );
  const { rows: candidates } = await pool.query(
    "SELECT name, party FROM candidates WHERE election_id = $1",
    [electionId]
  );

  const tally: Record<string, number> = {};
  candidates.forEach((c: any) => (tally[c.name] = 0));

  votes.forEach((v: any) => {
    const choice = decryptVote(v.encrypted_vote, decryptionKey as string);
    if (tally[choice] !== undefined) tally[choice]++;
  });

  const formattedResults = candidates.map((c: any) => ({
    candidate_name: c.name,
    party: c.party,
    vote_count: tally[c.name],
  }));

  res.json({ success: true, results: formattedResults });
});

/**
 * Add Candidate
 */
router.post("/add-candidate", authorize(["admin"]), async (req, res) => {
  const { electionId, name, party } = req.body;

  const electionRes = await pool.query(
    "SELECT status FROM elections WHERE election_id = $1",
    [electionId]
  );
  const election = electionRes.rows[0];
  if (election.status !== "DRAFT") {
    return res.status(403).json({ error: "Cannot add candidates to an active/closed election." });
  }

  await pool.query(
    "INSERT INTO candidates (candidate_id, election_id, name, party) VALUES ($1, $2, $3, $4)",
    [crypto.randomUUID(), electionId, name, party]
  );
  res.json({ success: true });
});

export default router;
