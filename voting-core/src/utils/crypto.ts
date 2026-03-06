import crypto from "crypto";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";

// US 6.1: Secret Key for Database Integrity
const DB_INTEGRITY_KEY = process.env.DB_INTEGRITY_KEY || 'change_this_in_production_key';

export const generateVoteId = () => uuidv4();

/**
 * US 2.3: AES-256 Encryption for the vote content
 */
export const encryptVote = (vote: string, key: string) => {
  return CryptoJS.AES.encrypt(vote, key).toString();
};

export const decryptVote = (ciphertext: string, key: string) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const hashData = (data: string, salt: string = ""): string => {
    return crypto.createHash("sha256").update(data + salt).digest("hex");
};

/**
 * US 6.2: Generate a digital seal (HMAC) for the database row.
 * This prevents manual tampering with the SQLite file.
 */
export const generateIntegritySignature = (voteId: string, electionId: string, encryptedVote: string, timestamp: number): string => {
    // Canonical format: Data order must be identical for verification later
    const payload = `${voteId}|${electionId}|${encryptedVote}|${timestamp}`;
    return crypto
        .createHmac("sha256", DB_INTEGRITY_KEY)
        .update(payload)
        .digest("hex");
};

/**
 * US 2.5: Generate a unique confirmation receipt for the voter.
 */
export const generateReceipt = (voteId: string, userIdHash: string): string => {
  const salt = process.env.RECEIPT_SALT || 'secure_ballot_salt_2026';
  return crypto.createHash("sha256").update(voteId + userIdHash + salt).digest("hex");
};