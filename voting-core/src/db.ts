import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_FILE_PATH = path.join(__dirname, "..", "..", "backend", "voting_system.db");

export const openDB = async () => {
  const db = await open({
    filename: DB_FILE_PATH,
    driver: sqlite3.Database,
  });

  // CRITICAL for Epic 3: Enable Foreign Key support
  // This ensures that you can't add a candidate to an election that doesn't exist.
  await db.get("PRAGMA foreign_keys = ON");
  
  return db;
};

export const initDB = async () => {
  const db = await openDB();

  // We keep this here as a safety measure, but Python is 
  // now the primary 'Schema Master' for the other tables.
  await db.run(`
    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      encrypted_vote TEXT NOT NULL,
      vote_hash TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      receipt_hash TEXT NOT NULL
    )
  `);

  console.log("✅ Voting-core connected to shared DB at:", DB_FILE_PATH);
  return db;
};