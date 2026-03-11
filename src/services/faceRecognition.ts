

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

import Tesseract from 'tesseract.js';

/**
 * Verify a Voter ID or Aadhaar document via local OCR (frontend only)
 * Eliminates backend 502 memory issues.
 */
export async function verifyDocument(
  documentImage: string,
  name: string,
  dob: string,
  documentType: "voterId" | "aadhaar" = "voterId",
  aadhaarNumber?: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`🔍 Starting local OCR verification for ${documentType}...`);

    // Tesseract.js recognizes base64 images directly
    const result = await Tesseract.recognize(
      documentImage,
      'eng',
      { logger: m => console.log(m) } // Optional: logs progress to console
    );

    const text = result.data.text.toUpperCase();
    console.log("📝 Extracted OCR Text:", text.substring(0, 200) + "...");

    // Keywords for Voter ID (EPIC) and Aadhaar card
    const VALID_KEYWORDS = documentType === "voterId" 
      ? ["ELECTION", "ELECTORAL", "IDENTITY", "VOTER", "EPIC"]
      : ["AADHAAR", "UIDAI", "UNIQUE IDENTIFICATION", "GOVERNMENT"];

    const matchedKeyword = VALID_KEYWORDS.some(kw => text.includes(kw));

    const nameParts = name.toUpperCase().split(/\s+/).filter(part => part.length > 0);
    // Be slightly forgiving if name is empty, though UI validates it
    const isNameMatched = nameParts.length === 0 || nameParts.every(part => text.includes(part));

    let isNumberMatched = true;
    if (documentType === "aadhaar" && aadhaarNumber) {
      // Aadhaar number in OCR might have spaces, dashes, etc.
      const cleanAadhaar = aadhaarNumber.replace(/\D/g, "");
      // Look for the 12 digit number in the text, allowing for spaces in between
      // e.g. "1234 5678 9012"
      const aadhaarVariants = [
        cleanAadhaar,
        `${cleanAadhaar.slice(0, 4)} ${cleanAadhaar.slice(4, 8)} ${cleanAadhaar.slice(8, 12)}`
      ];
      isNumberMatched = aadhaarVariants.some(variant => text.replace(/\s+/g, "").includes(cleanAadhaar) || text.includes(variant));
    }


    if (matchedKeyword && isNameMatched && isNumberMatched) {
      console.log(`✅ ${documentType} verified successfully.`);
      return { success: true, message: "Document verified" };
    }

    if (!matchedKeyword) {
      console.warn(`❌ ${documentType} verification failed - keywords not found.`);
      return {
        success: false,
        message: `Could not verify document. Ensure it is a valid ${documentType === "voterId" ? "Voter ID" : "Aadhaar card"}.`
      };
    }

    if (!isNameMatched) {
      console.warn(`❌ ${documentType} verification failed - name mismatch. OCR didn't find the registered name`);
      return {
        success: false,
        message: `Could not verify document. Document name does not match the registered Full Name (${name}).`
      };
    }

    if (!isNumberMatched) {
      console.warn(`❌ ${documentType} verification failed - Aadhaar number mismatch.`);
      return {
        success: false,
        message: `Could not verify document. Aadhaar number does not match registered number.`
      };
    }

  } catch (error) {
    console.error("❌ OCR processing error:", error);
    return {
      success: false,
      message: "OCR processing failed. Please try a clearer image.",
    };
  }
}

export default {
  registerUserFaces,
  recognizeUserFace,
  checkFaceServerHealth,
  verifyDocument,
};
