import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import { AnimatedProgress } from "@/components/PremiumComponents";
import { recognizeUserFace } from "@/services/faceRecognition";
import { Smartphone, Camera, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [voterId, setVoterId] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"biometric" | "otp">("biometric");
  const [isLoading, setIsLoading] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  /* =======================
     STEP 1: BIOMETRIC LOGIN
     ======================= */
  const handleBiometricSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!voterId) {
      toast({
        title: "Required",
        description: "Enter Aadhaar / Voter ID",
        variant: "destructive",
      });
      return;
    }

    const faceImage = webcamRef.current?.getScreenshot();
    if (!faceImage) {
      toast({
        title: "Camera Error",
        description: "Camera access required for verification",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await recognizeUserFace(voterId, faceImage);

      if (!result.success || !result.userIdHash) {
        throw new Error(result.message || "Biometric verification failed");
      }

      // Save hash for OTP verification
      sessionStorage.setItem("userIdHash", result.userIdHash);

      setStep("otp");

      toast({
        title: "Biometric Verified",
        description: "OTP has been generated and sent",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: err.message || "Face recognition failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================
     STEP 2: OTP VERIFY
     ======================= */
  /* =======================
   STEP 2: OTP VERIFY
   ======================= */
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userIdHash = sessionStorage.getItem("userIdHash");

      const response = await axios.post(
        "http://localhost:5001/api/verify-otp",
        {
          userIdHash,
          otp,
        },
      );

      // EPIC 2 CHANGE: Store the JWT token for backend authentication
      if (response.data.success && response.data.token) {
        // Save the "Passport" (JWT) to local storage
        localStorage.setItem("voterToken", response.data.token);

        // Optional: Save the hashed ID if you need it for the dashboard
        localStorage.setItem("voterIdHash", userIdHash || "");

        toast({
          title: "Login Successful",
          description: "Your secure session is now active.",
        });

        navigate("/dashboard/voter");
      } else {
        throw new Error(response.data.message || "Invalid OTP");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description:
          err.response?.data?.message || "Please check the OTP and try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
          <div className="w-full max-w-lg bg-white shadow-xl border-t-4 border-primary-700 p-8">
            <AnimatedProgress
              currentStep={step === "otp" ? 2 : 1}
              totalSteps={2}
              className="mb-6"
            />

            <AnimatePresence mode="wait">
              {step === "biometric" ? (
                <motion.form
                  key="biometric"
                  onSubmit={handleBiometricSubmit}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Webcam */}
                  <div className="relative aspect-video border overflow-hidden">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 text-xs text-white flex gap-2">
                      <Camera size={14} /> Live Biometric Scan
                    </div>
                  </div>

                  {/* Voter ID */}
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={voterId}
                      onChange={(e) => setVoterId(e.target.value)}
                      placeholder="Aadhaar / Voter ID"
                      className="w-full pl-10 py-3 border rounded"
                    />
                  </div>

                  <Button className="w-full h-14" disabled={isLoading}>
                    {isLoading ? "Verifying Face..." : "Verify Identity"}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp"
                  onSubmit={handleOtpSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6 text-center"
                >
                  <Smartphone size={40} className="mx-auto text-primary-700" />
                  <p className="text-sm text-neutral-500">
                    Enter the OTP sent to your registered contact
                  </p>

                  <input
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="w-full text-center text-3xl tracking-widest border py-4"
                    placeholder="000000"
                  />

                  <Button className="w-full h-14" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Enter Voting Portal"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setStep("biometric")}
                    className="text-xs underline text-neutral-400"
                  >
                    Re-scan face
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Layout>
    </PageWrapper>
  );
}
