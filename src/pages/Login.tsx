import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Added for API calls
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageWrapper } from "@/components/PageWrapper";
import { AnimatedProgress } from "@/components/PremiumComponents";
import {
  Shield,
  Mail,
  Lock,
  ArrowRight,
  Smartphone,
  CheckCircle,
  FileCheck,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otp, setOtp] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter your registered email and password.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // 1. ADMIN LOGIN CHECK
      if (email === "admin" && password === "admin123") {
        setIsLoading(false);
        toast({ title: "Admin Access Granted" });
        navigate("/dashboard/admin");
        return;
      }

      // 2. BACKEND API CALL (US 1.4 & US 1.5)
      // This sends the ID/Email to be hashed and checked against the 'results' table
      const response = await axios.post("http://localhost:5001/api/recognize-face", {
        userId: email, // Your backend uses this to generate the hash
        password: password
      });

      if (response.data.success) {
        // Store the anonymous hash for the voting session
        sessionStorage.setItem("userIdHash", response.data.userIdHash);
        
        setIsLoading(false);
        setStep("otp");
        toast({
          title: "Identity Verified",
          description: "Enter the code sent to your device.",
        });
      }
    } catch (error: any) {
      setIsLoading(false);
      
      // US 1.4: Handle Already Voted Gracefully
      if (error.response && error.response.status === 403) {
        navigate("/already-voted");
      } else {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: error.response?.data?.message || "Invalid credentials.",
        });
      }
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const userIdHash = sessionStorage.getItem("userIdHash");
      
      // Verify OTP with backend
      const response = await axios.post("http://localhost:5001/api/verify-otp", {
        userIdHash: userIdHash,
        otp: otp
      });

      if (response.data.success) {
        setIsLoading(false);
        toast({ title: "Authentication Successful" });
        navigate("/dashboard/voter");
      }
    } catch (error: any) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "OTP Verification Failed",
        description: error.response?.data?.message || "Invalid code.",
      });
    }
  };

  return (
    <PageWrapper>
      <Layout>
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center py-12 px-4 relative">
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          </div>

          <div className="w-full max-w-lg relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm border border-neutral-200 mb-4">
                <Shield className="h-8 w-8 text-primary-700" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 uppercase tracking-wide">
                Secure System Access
              </h1>
              <p className="text-neutral-500 text-sm mt-2">Secure Digital Identity Portal</p>
            </div>

            <div className="bg-white rounded-sm shadow-md border-t-4 border-t-primary-700 border-x border-b border-neutral-200 p-8 md:p-10">
              {/* Stepper */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  <span className={step === 'credentials' ? 'text-primary-700' : ''}>1. Credentials</span>
                  <span className={step === 'otp' ? 'text-primary-700' : ''}>2. Verification</span>
                </div>
                <AnimatedProgress currentStep={step === 'otp' ? 2 : 1} totalSteps={2} className="h-1" />
              </div>

              <AnimatePresence mode="wait">
                {step === "credentials" ? (
                  <motion.form key="credentials" onSubmit={handleCredentialsSubmit} className="space-y-6"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    
                    <div className="bg-primary-50 border-l-4 border-primary-700 p-4 mb-6">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-primary-700 flex-shrink-0" />
                        <div className="ml-3">
                          <p className="text-sm text-primary-800">
                            Confirm you are on <span className="font-bold">securevote.gov</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label htmlFor="email" className="text-neutral-700 font-bold uppercase text-xs">User ID / Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                          <input id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-sm focus:ring-1 focus:ring-primary-700 outline-none"
                            placeholder="Enter ID" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-neutral-700 font-bold uppercase text-xs">Password</Label>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-sm focus:ring-1 focus:ring-primary-700 outline-none"
                            placeholder="••••••••" />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold py-6 uppercase">
                      {isLoading ? "Verifying..." : "Proceed to Verification"}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form key="otp" onSubmit={handleOtpSubmit} className="space-y-6"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    
                    <div className="text-center mb-6">
                      <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                        <Smartphone className="h-8 w-8 text-neutral-600" />
                      </div>
                      <h3 className="text-lg font-bold">Two-Factor Authentication</h3>
                      <p className="text-sm text-neutral-500 mt-2">Enter the 6-digit code sent to your device.</p>
                    </div>

                    <input id="otp" type="text" value={otp} 
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000" maxLength={6}
                      className="w-full py-4 border-2 border-neutral-200 rounded-sm text-center text-3xl font-mono focus:border-primary-700 outline-none" />

                    <Button type="submit" disabled={isLoading} className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-6 uppercase">
                      {isLoading ? "Authenticating..." : "Verify Identity"}
                    </Button>

                    <button type="button" onClick={() => setStep("credentials")} className="w-full text-sm text-neutral-500 underline">
                      Return to Credentials
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Layout>
    </PageWrapper>
  );
}