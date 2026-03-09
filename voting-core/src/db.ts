import pkg from "pg";
const { Pool } = pkg;

// ── PostgreSQL connection pool ────────────────────────────────
// On Render, DATABASE_URL is automatically injected.
// Locally, individual DB_* env vars (from docker-compose) are used.
export const pool = process.env.DATABASE_URL
  ? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Render managed PostgreSQL
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  })
  : new Pool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "voting",
    password: process.env.DB_PASSWORD || "voting123",
    database: process.env.DB_NAME || "votingdb",
    port: Number(process.env.DB_PORT) || 5432,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

pool.on("error", (err: Error) => {
  console.error("❌ Unexpected PostgreSQL pool error:", err.message);
});

// ── Database initialisation ───────────────────────────────────
export const initDB = async (): Promise<void> => {

  // Retry loop – waits for Postgres container to be ready
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ PostgreSQL connection established.");
      break;
    } catch (err: any) {
      console.log(`⏳ Waiting for PostgreSQL... attempt ${attempt}/10`);
      if (attempt === 10) throw err;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ── votes table ───────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS votes (
        vote_id             TEXT PRIMARY KEY,
        election_id         TEXT,
        candidate_id        TEXT,
        encrypted_vote      TEXT,
        vote_hash           TEXT,
        timestamp           BIGINT,
        previous_hash       TEXT,
        block_hash          TEXT,
        receipt_hash        TEXT,
        integrity_signature TEXT
      )
    `);

    // ── audit_log table ───────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id         SERIAL PRIMARY KEY,
        action     TEXT,
        table_name TEXT,
        row_id     TEXT,
        old_value  TEXT,
        new_value  TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ── elections table ───────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS elections (
        election_id       TEXT PRIMARY KEY,
        title             TEXT,
        description       TEXT,
        start_time        BIGINT,
        end_time          BIGINT,
        status            TEXT CHECK(status IN ('DRAFT','ACTIVE','PAUSED','CLOSED')),
        created_by        TEXT,
        created_at        BIGINT,
        results_published INTEGER DEFAULT 0
      )
    `);

    // ── candidates table ──────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        candidate_id TEXT PRIMARY KEY,
        election_id  TEXT REFERENCES elections(election_id),
        name         TEXT,
        party        TEXT
      )
    `);

    // ── election_voters table ─────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS election_voters (
        election_id  TEXT,
        user_id_hash TEXT,
        has_voted    INTEGER DEFAULT 0,
        PRIMARY KEY (election_id, user_id_hash)
      )
    `);

    // ── Tamper-trap trigger function ──────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION trap_vote_tampering_fn()
      RETURNS TRIGGER LANGUAGE plpgsql AS $$
      BEGIN
        INSERT INTO audit_log (action, table_name, row_id, old_value, new_value)
        VALUES (
          'UNAUTHORIZED_UPDATE_ATTEMPT', 'votes',
          OLD.vote_id, OLD.encrypted_vote, NEW.encrypted_vote
        );
        RAISE EXCEPTION 'Security Error: Ballots are immutable and cannot be changed.';
      END;
      $$
    `);

    // Create trigger only if it does not already exist
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'trap_vote_tampering'
        ) THEN
          CREATE TRIGGER trap_vote_tampering
          BEFORE UPDATE ON votes
          FOR EACH ROW EXECUTE FUNCTION trap_vote_tampering_fn();
        END IF;
      END $$
    `);

    await client.query("COMMIT");
    console.log("✅ PostgreSQL schema ready with tamper-trap trigger.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};