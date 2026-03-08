

// Use relative URL so requests are proxied through Nginx in Docker.
// For local dev (npm run dev), ensure Flask is running on :5000 and
// add a Vite proxy for /api → http://localhost:5000 in vite.config.ts.
const FACE_API_URL = "/api";

export interface FaceRecognitionResult {
  success: boolean;
  message: string;
  userIdHash?: string;
  debug_otp?: string;
  otp?: string;
}

export interface RegistrationResult {
  success: boolean;
  message: string;
}

/**
 * Register a user with biometric face images
 */
export async function registerUserFaces(
  userId: string,
  phoneNumber: string,
  faceImages: string[] // 4 base64 images
): Promise<RegistrationResult> {
  try {
    const response = await fetch(`${FACE_API_URL}/register-face`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        phoneNumber,
        faceImages,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    console.log("✅ Registration result:", result);
    return result;
  } catch (error) {
    console.error("❌ Registration error:", error);
    return {
      success: false,
      message: `Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Recognize a user using their ID and a captured face image
 * MODIFIED: Now accepts userId to perform a 1-to-1 match on the backend
 */

export async function recognizeUserFace(
  userId: string,
  faceImage: string, // base64 image
  tolerance: number = 0.6
): Promise<FaceRecognitionResult> {
  console.log("➡️ Sending recognize-face payload", {
    userId,
    faceImagePresent: !!faceImage,
    faceImageLength: faceImage?.length,
  });

  try {
    const response = await fetch(`${FACE_API_URL}/recognize-face`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId, // Added for backend optimization
        faceImage,
        tolerance,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    console.log("🔍 Recognition result:", result);
    return result;
  } catch (error) {
    console.error("❌ Recognition error:", error);
    return {
      success: false,
      message: `Recognition failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Check if face recognition server is running
 */
export async function checkFaceServerHealth() {
  try {
    const response = await fetch(`${FACE_API_URL}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("❌ Server health check failed:", error);
    return { status: "Offline", registered_users: 0 };
  }
}

/**
 * Verify a Voter ID document via OCR
 */
export async function verifyDocument(
  documentImage: string,
  name: string,
  dob: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${FACE_API_URL}/verify-document`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentImage,
        fullName: name,
        dateOfBirth: dob,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Verification failed");
    }

    return result;
  } catch (error) {
    console.error("❌ Verification error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default {
  registerUserFaces,
  recognizeUserFace,
  checkFaceServerHealth,
  verifyDocument,
};
