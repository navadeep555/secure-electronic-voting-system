import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";

export const generateVoteId = () => uuidv4();

export const encryptVote = (vote: string, key: string) => {
  return CryptoJS.AES.encrypt(vote, key).toString();
};

export const decryptVote = (ciphertext: string, key: string) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const hashData = (data: string, salt: string = ""): string => {
    return CryptoJS.SHA256(data + salt).toString();
};

/**
 * US2.5: Generate a unique confirmation receipt.
 * This satisfies the requirement for a unique acknowledgment 
 * after successful ballot submission.
 */
export const generateReceipt = (voteId: string): string => {
  // Use a fallback salt if the environment variable isn't set
  const salt = process.env.RECEIPT_SALT || 'secure_ballot_salt_2026';
  return CryptoJS.SHA256(voteId + salt).toString();
};