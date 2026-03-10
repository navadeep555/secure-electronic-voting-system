
import axios from "axios";

/**
 * Submits an encrypted ballot to the Voting Core.
 * @param electionId - The ID of the election.
 * @param candidate - The name of the selected candidate.
 * @param pin - Used by the backend to derive the cryptographic seal for the ballot.
 */
export const castSecureVote = async (
  electionId: string,
  candidate: string,
  pin: string
) => {
  // Use relative path so Vercel can rewrite it to the real backend
  const API_URL = "/api/voter/cast-vote";

  const token = localStorage.getItem("voterToken");

  if (!token) {
    throw new Error("Session expired. Please log in again.");
  }

  try {
    const response = await axios.post(
      API_URL,
      {
        electionId,
        vote: candidate,
        encryptionKey: pin, // Used for salt/encryption on the server side
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 15000, // 15s timeout for blockchain/ledger confirmation
      }
    );

    // Expected Response: { success: true, receipt: "0x...", message: "..." }
    return response.data;
  } catch (error: any) {
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.details ||
      "The voting server is currently unreachable.";

    console.error("Service Layer Voting Error:", errorMsg);
    throw new Error(errorMsg);
  }
};