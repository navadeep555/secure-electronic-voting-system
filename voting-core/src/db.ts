import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_FILE_PATH = path.join(__dirname, "..", "..", "backend", "voting_system.db");

export const openDB = async () => {
  const db = await open({
    filename: DB_FILE_PATH,
    driver: sqlite3.Database,
  });

  // Enable Foreign Key support
  await db.get("PRAGMA foreign_keys = ON");
  
  return db;
};

export const initDB = async () => {
  const db = await openDB();

  // Note: Standardized column names to match the Python app.py
  await db.run(`
    CREATE TABLE IF NOT EXISTS votes (
      vote_id TEXT PRIMARY KEY,
      election_id TEXT,
      candidate_id TEXT, 
      timestamp INTEGER,
      previous_hash TEXT,
      block_hash TEXT,
      integrity_signature TEXT
    )
  `);

  //  Create Audit Log table to track unauthorized modifications
  await db.run(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT,
      table_name TEXT,
      row_id TEXT,
      old_value TEXT,
      new_value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // TAMPER TRAP TRIGGER
  // This trigger blocks any UPDATE attempt and logs it to the audit table.
  await db.run(`
    CREATE TRIGGER IF NOT EXISTS trap_vote_tampering
    BEFORE UPDATE ON votes
    BEGIN
      INSERT INTO audit_log (action, table_name, row_id, old_value, new_value)
      VALUES ('UNAUTHORIZED_UPDATE_ATTEMPT', 'votes', OLD.vote_id, OLD.candidate_id, NEW.candidate_id);
      SELECT RAISE(ABORT, 'Security Error: Ballots are immutable and cannot be changed.');
    END;
  `);

  console.log("✅ Voting-core connected to shared DB with Audit Triggers at:", DB_FILE_PATH);
  return db;
};