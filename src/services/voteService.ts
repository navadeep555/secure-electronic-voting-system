// src/services/voteService.ts
import axios from "axios";

/**
 * US2.2, US2.3, US2.4: Securely submits an encrypted ballot to the Voting Core.
 * @param candidate - The name of the selected candidate.
 * @param pin - The 4-6 digit PIN used as an encryption key/salt.
 * @param token - The JWT received from the Python Auth service.
 */
export const castSecureVote = async (candidate: string, pin: string, token: string) => {
  // Ensure the port (5002) and path (/api/votes) match your Node.js server.ts
  const API_URL = "http://localhost:5002/api/votes/cast-vote";

  try {
    const response = await axios.post(
      API_URL,
      {
        vote: candidate, // Raw ballot data to be encrypted by the backend
        encryptionKey: pin, // Used to secure the vote data
      },
      {
        headers: {
          // US2.2: Prove to the Voting Core that this user is authenticated
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // US2.5: Returns the success status and the SHA-256 receipt hash
    return response.data;
  } catch (error: any) {
    // Better error logging for debugging
    console.error("Axios Voting Error:", error.response?.data || error.message);
    
    // Throwing the error allows VotingPage.tsx to catch it and show a toast
    throw new Error(
      error.response?.data?.message || "Communication error with the voting server."
    );
  }
};