// src/services/voteService.ts
import axios from "axios";

/**
 * US2.2, US2.3, US2.4: Securely submits an encrypted ballot to the Voting Core.
 * @param candidate - The name of the selected candidate.
 * @param pin - The 4-6 digit PIN used as an encryption key/salt.
 * @param token - The JWT received from the Python Auth service.
 */

export const castSecureVote = async (
  electionId: string,
  candidate: string,
  pin: string
) => {
  const API_URL = "http://localhost:5002/api/votes/cast-vote";

  // ✅ Always fetch the real JWT
  const token = localStorage.getItem("voterToken");

  if (!token) {
    throw new Error("Authentication token missing. Please log in again.");
  }

  try {
    const response = await axios.post(
      API_URL,
      {
        electionId,
        vote: candidate,
        encryptionKey: pin,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.details ||
      error.message;

    console.error("Service Layer Voting Error:", errorMsg);
    throw new Error(errorMsg);
  }
};
