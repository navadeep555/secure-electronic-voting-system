import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

// Define the path once at the top level so all functions can use it
const DB_FILE_PATH = path.join(__dirname, "..", "..", "backend", "voting_system.db");

export const openDB = async () => {
  return open({
    filename: DB_FILE_PATH,
    driver: sqlite3.Database,
  });
};

export const initDB = async () => {
  const db = await openDB();
  
  // EPIC 2: Anonymous Voting Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      encrypted_vote TEXT NOT NULL,
      vote_hash TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      receipt_hash TEXT NOT NULL
    )
  `);

  // Now 'DB_FILE_PATH' is accessible here!
  console.log("✅ Voting Core connected to shared DB at:", DB_FILE_PATH);
  return db;
};