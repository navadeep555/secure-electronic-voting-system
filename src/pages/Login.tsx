import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageWrapper } from "@/components/PageWrapper";
import { GlassmorphCard, AnimatedProgress } from "@/components/PremiumComponents";
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

    // Simulate API call check
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // ADMIN LOGIN CHECK
    if (email === "admin" && password === "admin123") {
      setIsLoading(false);
      toast({
        title: "Admin Access Granted",
        description: "Redirecting to administration dashboard...",
      });
      navigate("/dashboard/admin");
      return;
    }

    // VOTER LOGIN FLOW
    setIsLoading(false);
    setStep("otp");
    toast({
      title: "Security Verification",
      description: "Enter the code sent to your registered mobile device.",
    });
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Invalid Verification Code",
        description: "Please enter the 6-digit code exactly as received.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast({
      title: "Authentication Successful",
      description: "Access granted. Redirecting to voter dashboard...",
    });
    navigate("/dashboard/voter");
  };

  return (
    <PageWrapper>
      <Layout>
        {/* Official Background: Neutral gray with subtle texture */}
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center py-12 px-4 relative">

          {/* Subtle pattern background */}
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          </div>

          <div className="w-full max-w-lg relative z-10">

            {/* Official Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm border border-neutral-200 mb-4">
                <Shield className="h-8 w-8 text-primary-700" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 uppercase tracking-wide">
                Secure System Access
              </h1>
              <p className="text-neutral-500 text-sm mt-2">
                Secure Digital Identity Portal
              </p>
            </div>

            {/* Login Card - Solid, Official */}
            <div className="bg-white rounded-sm shadow-md border-t-4 border-t-primary-700 border-x border-b border-neutral-200 p-8 md:p-10">

              {/* Progress Stepper */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  <span className={step === 'credentials' ? 'text-primary-700' : ''}>1. Credentials</span>
                  <span className={step === 'otp' ? 'text-primary-700' : ''}>2. Verification</span>
                </div>
                <AnimatedProgress
                  currentStep={step === 'otp' ? 2 : 1}
                  totalSteps={2}
                  className="h-1"
                />
              </div>

              <AnimatePresence mode="wait">
                {step === "credentials" ? (
                  <motion.form
                    key="credentials"
                    onSubmit={handleCredentialsSubmit}
                    className="space-y-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-primary-50 border-l-4 border-primary-700 p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-primary-700" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-primary-800">
                            Please ensure you are on the official <span className="font-bold">securevote.gov</span> domain before entering credentials.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label htmlFor="email" className="text-neutral-700 font-bold uppercase text-xs tracking-wide">
                          User ID / Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                          <input
                            id="email"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-300 rounded-sm text-neutral-900 focus:ring-1 focus:ring-primary-700 focus:border-primary-700 focus:outline-none transition-all shadow-inner"
                            placeholder="Enter ID or Email"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-neutral-700 font-bold uppercase text-xs tracking-wide">
                            Password
                          </Label>
                          <Link to="/forgot-password" className="text-xs text-primary-700 hover:underline">
                            Forgot Password?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                          <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-300 rounded-sm text-neutral-900 focus:ring-1 focus:ring-primary-700 focus:border-primary-700 focus:outline-none transition-all shadow-inner"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold uppercase tracking-wide py-6 rounded-sm shadow-md transition-all flex items-center justify-center gap-2 mt-6"
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : (
                        <>
                          Proceed to Verification <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="otp"
                    onSubmit={handleOtpSubmit}
                    className="space-y-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center mb-6">
                      <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                        <Smartphone className="h-8 w-8 text-neutral-600" />
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-neutral-500 max-w-xs mx-auto mt-2">
                        Enter the 6-digit session code sent to your registered mobile number ending in <span className="font-mono font-bold text-neutral-900">**89</span>.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="otp" className="sr-only">Verification Code</Label>
                      <input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="0 0 0 0 0 0"
                        maxLength={6}
                        className="w-full px-4 py-4 bg-white border-2 border-neutral-200 rounded-sm text-center text-3xl tracking-[0.5em] font-mono text-neutral-900 focus:border-primary-700 focus:outline-none transition-colors"
                      />
                      <p className="text-xs text-center text-neutral-400">
                        Code expires in 04:59
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-green-700 hover:bg-green-800 text-white font-bold uppercase tracking-wide py-6 rounded-sm shadow-md transition-all flex items-center justify-center gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? "Authenticating..." : (
                        <>
                          Verify Identity <CheckCircle className="h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setStep("credentials")}
                      className="w-full text-sm text-neutral-500 hover:text-primary-700 underline transition-colors"
                    >
                      Return to Credentials
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

            </div>

            {/* Footer Links */}
            <div className="mt-8 text-center text-xs text-neutral-400 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1"><FileCheck className="h-3 w-3" /> Privacy Policy</span>
              <span>|</span>
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Terms of Service</span>
            </div>

          </div>
        </div>
      </Layout>
    </PageWrapper>
  );
}
