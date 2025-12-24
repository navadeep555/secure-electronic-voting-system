/**
 * Face Recognition Service
 * Handles communication with Python facial recognition backend
 */

const FACE_API_URL = "http://localhost:5001/api";

export interface FaceRecognitionResult {
  success: boolean;
  message: string;
  matched_user?: string;
  distance?: number;
  tolerance?: number;
  all_matches?: Record<string, any>;
}

export interface RegistrationResult {
  success: boolean;
  message: string;
  valid_faces?: number;
  total_stages?: number;
}

/**
 * Register a user with 4 biometric face images
 */
export async function registerUserFaces(
  userId: string,
  faceImages: string[] // 4 base64 images
): Promise<RegistrationResult> {
  try {
    const response = await fetch(`${FACE_API_URL}/register-face`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        faceImages,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: RegistrationResult = await response.json();
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
 * Recognize a user from a single face image
 */
export async function recognizeUserFace(
  faceImage: string, // base64 image
  tolerance: number = 0.6
): Promise<FaceRecognitionResult> {
  try {
    const response = await fetch(`${FACE_API_URL}/recognize-face`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        faceImage,
        tolerance,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: FaceRecognitionResult = await response.json();
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
 * Get list of all registered users
 */
export async function getRegisteredUsers() {
  try {
    const response = await fetch(`${FACE_API_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("👥 Registered users:", result);
    return result;
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return {
      success: false,
      message: `Failed to fetch users: ${error instanceof Error ? error.message : "Unknown error"}`,
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
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Server health:", result);
    return result;
  } catch (error) {
    console.error("❌ Server health check failed:", error);
    return {
      status: "❌ Face Recognition Server is not running",
      registered_users: 0,
    };
  }
}

export default {
  registerUserFaces,
  recognizeUserFace,
  getRegisteredUsers,
  checkFaceServerHealth,
};
