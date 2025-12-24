import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SecurityBadge } from "@/components/ui/SecurityBadge";
import { PageWrapper } from "@/components/PageWrapper";
import { FloatingLabelInput, GlassmorphCard, MagneticButton, AnimatedProgress } from "@/components/PremiumComponents";
import { colors } from "@/lib/designTokens";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Smartphone,
  CheckCircle,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otp, setOtp] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep("otp");
    toast({
      title: "Verification Code Sent",
      description: "A 6-digit code has been sent to your phone.",
    });
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast({
      title: "Login Successful",
      description: "Welcome back! Redirecting to your dashboard...",
    });
    navigate("/dashboard/voter");
  };

  return (
    <PageWrapper>
      <Layout>
        {/* Premium gradient background */}
        <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-blue-950/20 to-neutral-900 flex items-center justify-center py-12 px-4 relative overflow-hidden">
          {/* Animated background glow elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
              style={{
                background: `radial-gradient(circle, ${colors.glow.blue}, transparent)`,
              }}
              animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
              initial={{ opacity: 0.1 }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full"
              style={{
                background: `radial-gradient(circle, ${colors.glow.purple}, transparent)`,
              }}
              animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
              transition={{ duration: 10, repeat: Infinity }}
              initial={{ opacity: 0.1 }}
            />
          </div>

          <motion.div 
            className="w-full max-w-md relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          >
            {/* Logo & Title Section */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <motion.div 
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 relative"
                animate={{
                  boxShadow: [
                    `0 0 0 rgba(91, 135, 255, 0.3)`,
                    `0 0 30px ${colors.glow.blue}`,
                    `0 0 0 rgba(91, 135, 255, 0.3)`,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/10 border border-primary-500/30" />
                <Shield className="h-10 w-10 text-primary-500 relative z-10" />
              </motion.div>

              <motion.h1 
                className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-primary-50 via-primary-100 to-accent-100 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                SecureVote
              </motion.h1>

              <motion.p 
                className="text-foreground-tertiary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {step === "credentials"
                  ? "Secure Voter Authentication"
                  : "Verify Your Identity"}
              </motion.p>
            </motion.div>

            {/* Main login card with glassmorphism */}
            <GlassmorphCard className="p-8 relative overflow-hidden" glow>
              {/* Card shimmer effect */}
              <motion.div
                className="absolute -top-40 -right-40 w-80 h-80 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${colors.glow.cyan}, transparent)`,
                  filter: "blur(60px)",
                }}
                animate={{
                  opacity: [0, 0.2, 0],
                  x: [0, 50, 0],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              />

              {/* Progress indicator */}
              <motion.div className="mb-6">
                <AnimatedProgress 
                  currentStep={step === "otp" ? 2 : 1} 
                  totalSteps={2} 
                />
              </motion.div>

              {/* Security badges */}
              <motion.div 
                className="flex items-center justify-between mb-8 gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <SecurityBadge type="encrypted" />
                <div className="flex-1" />
                <SecurityBadge type="secure" />
              </motion.div>

              {/* Form content with staggered animation */}
              <AnimatePresence mode="wait">
                {step === "credentials" ? (
                  <motion.form 
                    key="credentials"
                    onSubmit={handleCredentialsSubmit} 
                    className="space-y-6 relative z-10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Email input with floating label */}
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <Label htmlFor="email" className="text-foreground-secondary text-sm font-medium">
                        Email Address
                      </Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary group-hover:text-primary-400 transition-colors" />
                        <motion.input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          autoComplete="email"
                          className="w-full pl-12 pr-4 py-3 bg-neutral-800/50 border border-neutral-600/30 rounded-xl text-foreground-primary placeholder-foreground-tertiary focus:outline-none transition-all duration-300"
                          whileFocus={{
                            boxShadow: `0 0 20px ${colors.glow.blue}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                            borderColor: colors.primary[500],
                          }}
                        />
                      </div>
                    </motion.div>

                    {/* Password input with floating label and visibility toggle */}
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-foreground-secondary text-sm font-medium">
                          Password
                        </Label>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-accent-500 hover:text-accent-400 transition-colors"
                        >
                          Forgot?
                        </Link>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary group-hover:text-primary-400 transition-colors" />
                        <motion.input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="w-full pl-12 pr-12 py-3 bg-neutral-800/50 border border-neutral-600/30 rounded-xl text-foreground-primary placeholder-foreground-tertiary focus:outline-none transition-all duration-300"
                          whileFocus={{
                            boxShadow: `0 0 20px ${colors.glow.blue}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                            borderColor: colors.primary[500],
                          }}
                        />
                        <motion.button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-tertiary hover:text-foreground-secondary"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* Continue button with magnetic effect */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      className="pt-2"
                    >
                      <MagneticButton
                        onClick={(e) => {
                          const form = e.currentTarget.closest('form');
                          if (form) {
                            const submitEvent = new Event('submit', { bubbles: true });
                            form.dispatchEvent(submitEvent);
                          }
                        }}
                        className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:shadow-glow-blue transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <motion.span
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            Verifying...
                          </motion.span>
                        ) : (
                          <>
                            <Zap className="h-4 w-4" />
                            Continue
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </MagneticButton>
                    </motion.div>
                  </motion.form>
                ) : (
                  <motion.form 
                    key="otp"
                    onSubmit={handleOtpSubmit} 
                    className="space-y-6 relative z-10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* OTP info with animated icon */}
                    <motion.div 
                      className="text-center mb-6 p-4 bg-accent-500/10 rounded-xl border border-accent-500/20"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <motion.div 
                        className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-500/20 mb-3"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Smartphone className="h-6 w-6 text-accent-400" />
                      </motion.div>
                      <p className="text-sm text-foreground-secondary">
                        We've sent a verification code to your phone ending in <span className="font-semibold text-accent-400">****1234</span>
                      </p>
                    </motion.div>

                    {/* OTP input with monospace font */}
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <Label htmlFor="otp" className="text-foreground-secondary text-sm font-medium">
                        Verification Code
                      </Label>
                      <motion.input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        autoComplete="one-time-code"
                        className="w-full px-4 py-4 bg-neutral-800/50 border border-neutral-600/30 rounded-xl text-center text-2xl tracking-[0.5em] font-mono text-foreground-primary placeholder-foreground-tertiary focus:outline-none transition-all duration-300"
                        whileFocus={{
                          boxShadow: `0 0 20px ${colors.glow.cyan}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                          borderColor: colors.secondary[500],
                        }}
                      />
                    </motion.div>

                    {/* Verify button */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="pt-2"
                    >
                      <MagneticButton
                        onClick={(e) => {
                          const form = e.currentTarget.closest('form');
                          if (form) {
                            const submitEvent = new Event('submit', { bubbles: true });
                            form.dispatchEvent(submitEvent);
                          }
                        }}
                        className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:shadow-glow-blue transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <motion.span
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            Verifying...
                          </motion.span>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Verify & Login
                          </>
                        )}
                      </MagneticButton>
                    </motion.div>

                    {/* Back button */}
                    <motion.button
                      type="button"
                      onClick={() => setStep("credentials")}
                      className="w-full text-sm text-foreground-tertiary hover:text-foreground-secondary transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ← Use different credentials
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Security info footer */}
              <motion.div 
                className="mt-8 pt-6 border-t border-neutral-600/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex items-start gap-3 text-xs">
                  <Shield className="h-4 w-4 text-secondary-500 mt-0.5 flex-shrink-0" />
                  <p className="text-foreground-tertiary leading-relaxed">
                    Protected by encryption and multi-factor authentication. Session timeout: 15 minutes.
                  </p>
                </div>
              </motion.div>
            </GlassmorphCard>

            {/* Register CTA */}
            <motion.p 
              className="text-center text-sm text-foreground-tertiary mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              New voter?{" "}
              <Link to="/register" className="text-accent-400 hover:text-accent-300 font-medium transition-colors">
                Register now
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </Layout>
    </PageWrapper>
  );
}
