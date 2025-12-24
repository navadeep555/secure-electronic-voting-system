import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { PageWrapper } from "@/components/PageWrapper";
import { MagneticButton } from "@/components/PremiumComponents";
import { colors } from "@/lib/designTokens";
import {
  Shield,
  Vote,
  Users,
  CheckCircle,
  ArrowRight,
  Lock,
  Eye,
  FileCheck,
  Camera,
  UserCheck,
  BarChart3,
  Zap,
  Sparkles,
  Check,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// ADVANCED ANIMATION HOOKS & COMPONENTS
// ═══════════════════════════════════════════════════════════════

// Scroll-Triggered 3D Transform Hook - Parallax + 3D rotation
function use3DScroll(ref: React.RefObject<HTMLElement>) {
  const { scrollYProgress } = useScroll({ target: ref });
  
  const rotateX = useTransform(scrollYProgress, [0, 1], [15, -15]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1, 1.15]);
  const z = useTransform(scrollYProgress, [0, 1], [-500, 500]);
  
  return { rotateX, rotateY, scale, z };
}

// Parallax Hook - Creates depth effect
function useParallax(ref: React.RefObject<HTMLElement>, speed = 0.5) {
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], [0, 300 * speed]);
  return y;
}

// Mouse-tracking 3D tilt effect
function useMouseTilt() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotX = ((e.clientY - rect.top - centerY) / centerY) * 15;
    const rotY = ((e.clientX - rect.left - centerX) / centerX) * 15;
    
    x.set(rotY);
    y.set(rotX);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return { x, y, handleMouseMove, handleMouseLeave };
}

// Liquid Motion Component - Flowing organic shapes
function LiquidBlobComponent() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main flowing blob 1 */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-50"
        style={{
          background: `radial-gradient(circle, ${colors.primary[500]}, transparent)`,
          left: "10%",
          top: "20%",
        }}
        animate={{
          x: [0, 100, -50, 30, 0],
          y: [0, -80, 60, -40, 0],
          scale: [1, 1.3, 0.8, 1.2, 1],
          borderRadius: ["50%", "60% 40%", "30% 70%", "70% 30%", "50%"],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Main flowing blob 2 */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-50"
        style={{
          background: `radial-gradient(circle, ${colors.accent[500]}, transparent)`,
          right: "5%",
          bottom: "10%",
        }}
        animate={{
          x: [0, -120, 80, -60, 0],
          y: [0, 100, -70, 50, 0],
          scale: [1, 0.8, 1.4, 0.9, 1],
          borderRadius: ["60% 40%", "40% 60%", "70% 30%", "30% 70%", "60% 40%"],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      
      {/* Secondary blob 3 - Cyan accent */}
      <motion.div
        className="absolute w-64 h-64 rounded-full blur-3xl opacity-40"
        style={{
          background: `radial-gradient(circle, ${colors.secondary[500]}, transparent)`,
          left: "50%",
          top: "50%",
        }}
        animate={{
          x: [0, 60, -80, 40, 0],
          y: [0, -100, 70, -30, 0],
          scale: [0.8, 1.2, 0.6, 1.1, 0.8],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
}

// Enhanced Kinetic Typography - Letters bounce with momentum
function KineticText({ text, className = "" }: { text: string; className?: string }) {
  const letters = text.split("");

  return (
    <motion.div className={`${className} inline-block`}>
      {letters.map((letter, idx) => (
        <motion.span
          key={idx}
          className="inline-block"
          animate={{
            y: [0, -12, -20, -12, 0],
            rotateZ: [0, -5, 0, 5, 0],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 0.8,
            delay: idx * 0.08,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "easeInOut",
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
}

// Animated Letters Component - Creative text animation
function AnimatedText({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const wordVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
      },
    }),
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, idx) => (
        <motion.span key={idx} variants={wordVariants} className="inline-block mr-3">
          {word.split("").map((char, charIdx) => (
            <motion.span
              key={charIdx}
              animate={{
                y: [0, -8, 0],
                rotateZ: [0, 5, -5, 0],
              }}
              transition={{
                duration: 0.6,
                delay: idx * 0.1 + charIdx * 0.05,
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 3,
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      ))}
    </motion.div>
  );
}

// Scroll-triggered staggered text reveal
function ScrollRevealText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const letters = text.split("");

  return (
    <motion.div ref={ref} className={`${className} inline-block`}>
      {letters.map((letter, idx) => (
        <motion.span
          key={idx}
          className="inline-block"
          initial={{ opacity: 0, y: 40, rotateX: -90 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{
            duration: 0.6,
            delay: idx * 0.05,
            ease: "easeOut",
          }}
          style={{ perspective: 1000 }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
}

// Trust points for security strip
const trustPoints = [
  { label: "Military-Grade Encryption", icon: Lock },
  { label: "100% Anonymous Voting", icon: Eye },
  { label: "Blockchain Auditable", icon: FileCheck },
  { label: "Independent Verified", icon: CheckCircle },
];

// Core features
const features = [
  {
    icon: Camera,
    title: "Identity Verification",
    description: "Advanced biometric verification with liveness detection ensures only authorized voters participate.",
    color: "from-blue-500/20 to-blue-600/10",
  },
  {
    icon: Lock,
    title: "Anonymous Voting",
    description: "Your identity completely separated from your vote. No one can link ballot to you.",
    color: "from-purple-500/20 to-purple-600/10",
  },
  {
    icon: Eye,
    title: "Transparent Results",
    description: "Real-time public dashboards with full visibility into turnout and results.",
    color: "from-cyan-500/20 to-cyan-600/10",
  },
];

// How it works steps
const steps = [
  {
    number: 1,
    title: "Register",
    description: "Complete biometric verification in under 2 minutes",
  },
  {
    number: 2,
    title: "Authenticate",
    description: "Secure login with facial recognition or biometric",
  },
  {
    number: 3,
    title: "Vote",
    description: "Cast your ballot securely and anonymously",
  },
  {
    number: 4,
    title: "Verify",
    description: "Check your vote on public blockchain ledger",
  },
];

// Live stats
const liveStats = [
  { label: "Elections Conducted", value: "156", prefix: "" },
  { label: "Votes Cast", value: "8.7M", prefix: "" },
  { label: "Countries Using", value: "42", prefix: "" },
];

// AnimatedCounter Component
function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = value / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value, duration]);

  return <span ref={ref}>{count}</span>;
}

export default function Index() {
  const scrollRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  
  const { scrollYProgress } = useScroll({ target: scrollRef });
  const heroScroll = useScroll({ target: heroRef });
  const heroParallax = useParallax(heroRef, 0.5);

  return (
    <PageWrapper>
      <Layout>
        {/* ════════════════════════════════════════════════════════════ */}
        {/* 1️⃣ HERO SECTION - WITH 3D SCROLL EFFECTS */}
        {/* ════════════════════════════════════════════════════════════ */}
        <section ref={heroRef} className="relative min-h-screen overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center pb-32">
          {/* Liquid Motion Background */}
          <LiquidBlobComponent />

          {/* Animated background blobs with kinetic motion */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Blob 1 - Blue with rotation */}
            <motion.div
              className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
              style={{
                background: `radial-gradient(circle, ${colors.primary[500]}40, transparent)`,
              }}
              animate={{
                x: [0, 150, -80, 50, 0],
                y: [0, -150, 100, -60, 0],
                scale: [1, 1.4, 0.7, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Blob 2 - Purple */}
            <motion.div
              className="absolute top-1/3 -left-40 w-96 h-96 rounded-full blur-3xl"
              style={{
                background: `radial-gradient(circle, ${colors.accent[500]}40, transparent)`,
              }}
              animate={{
                x: [0, -150, 100, -80, 0],
                y: [0, 150, -100, 80, 0],
                scale: [1, 0.7, 1.3, 0.9, 1],
                rotate: [360, 180, 0],
              }}
              transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Blob 3 - Cyan */}
            <motion.div
              className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full blur-3xl"
              style={{
                background: `radial-gradient(circle, ${colors.secondary[500]}30, transparent)`,
              }}
              animate={{
                x: [0, 80, -120, 60, 0],
                y: [0, 80, 120, -60, 0],
                scale: [1, 1.2, 0.8, 1.1, 1],
              }}
              transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Content - NO scroll parallax effect */}
          <motion.div
            className="container relative z-10"
          >
            <div className="max-w-5xl">
              {/* Staggered entrance animations */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="space-y-0"
              >
                {/* Line 1 - Kinetic Text Animation - ALWAYS VISIBLE */}
                <KineticText
                  text="Secure"
                  className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-white drop-shadow-lg h-20 md:h-24 lg:h-28 flex items-center"
                />

                {/* Line 2 - ANONYMOUS - FADES & SHRINKS ANIMATION */}
                <motion.div
                  initial={{ opacity: 0, y: 50, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                  style={{ perspective: 1000 }}
                  className="relative flex h-20 md:h-24 lg:h-28 items-center"
                >
                  <motion.div
                    animate={{
                      opacity: [1, 1, 0, 0, 1],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      times: [0, 0.3, 0.4, 0.6, 1],
                      ease: "easeInOut",
                    }}
                  >
                    <div
                      className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-white"
                      style={{
                        filter: "drop-shadow(0 0 50px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 30px rgba(0, 255, 136, 0.8))",
                      }}
                    >
                      ANONYMOUS
                    </div>
                  </motion.div>
                </motion.div>

                {/* Line 3 - Bounce animation - ALWAYS VISIBLE */}
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                  className="h-20 md:h-24 lg:h-28 flex items-center"
                >
                  <motion.h1
                    className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-white drop-shadow-lg"
                    animate={{
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      repeatType: "loop",
                      repeatDelay: 4,
                      ease: "easeInOut",
                    }}
                  >
                    Democratic
                  </motion.h1>
                </motion.div>
              </motion.div>

              {/* Subtitle with pulse effect */}
              <motion.p
                className="text-base md:text-xl text-white font-semibold mt-12 mb-10 max-w-3xl leading-relaxed drop-shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
              >
                Cast your vote from anywhere with{" "}
                <motion.span 
                  className="text-cyan-300 font-bold"
                  animate={{ 
                    textShadow: [
                      "0 0 10px rgba(34, 211, 238, 0.5)",
                      "0 0 20px rgba(34, 211, 238, 1)",
                      "0 0 10px rgba(34, 211, 238, 0.5)",
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  military-grade security
                </motion.span>{" "}
                and{" "}
                <motion.span 
                  className="text-blue-300 font-bold"
                  animate={{ 
                    textShadow: [
                      "0 0 10px rgba(147, 197, 253, 0.5)",
                      "0 0 20px rgba(147, 197, 253, 1)",
                      "0 0 10px rgba(147, 197, 253, 0.5)",
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  complete anonymity
                </motion.span>
                . The future of democratic voting is here.
              </motion.p>

              {/* CTA Buttons with microinteractions */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <Link to="/register">
                  <MagneticButton
                    className="relative px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-2xl hover:shadow-blue-500/50 transition-all inline-flex items-center gap-2 group overflow-hidden"
                    intensity={0.4}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Register Now{" "}
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.span>
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"
                      initial={{ x: "100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </MagneticButton>
                </Link>

                <motion.button
                  className="px-8 py-4 border-2 border-blue-500/50 text-blue-400 font-bold rounded-xl hover:bg-blue-500/10 transition-all backdrop-blur-sm"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: `0 0 30px ${colors.primary[500]}`,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn How It Works
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced scroll indicator with pulse */}
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div 
              className="w-8 h-12 border-2 border-blue-500/50 rounded-full flex justify-center"
              animate={{
                borderColor: [
                  "rgba(59, 130, 246, 0.5)",
                  "rgba(59, 130, 246, 1)",
                  "rgba(59, 130, 246, 0.5)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="w-1.5 h-3 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full mt-2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </section>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* 2️⃣ TRUST / SECURITY STRIP */}
        {/* ════════════════════════════════════════════════════════════ */}
        <section className="py-16 bg-neutral-900/50 border-y border-neutral-800/50">
          <div className="container">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {trustPoints.map((point, i) => {
                const Icon = point.icon;
                return (
                  <motion.div
                    key={i}
                    className="group"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                    }}
                  >
                    <motion.div
                      className="flex items-center gap-4 p-6 rounded-xl border border-neutral-700/50 bg-neutral-800/30 backdrop-blur-sm group-hover:border-blue-500/50 transition-all"
                      whileHover={{
                        boxShadow: `0 0 30px ${colors.primary[500]}40`,
                        backgroundColor: "rgba(30, 58, 138, 0.1)",
                      }}
                    >
                    <motion.div
                      className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <Icon className="h-6 w-6 text-blue-400" />
                    </motion.div>
                    <span className="text-sm font-bold text-white drop-shadow-md">{point.label}</span>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* 3️⃣ FEATURES SECTION - WITH 3D TILT MICROINTERACTIONS */}
        {/* ════════════════════════════════════════════════════════════ */}
        <section ref={featuresRef} className="py-24 relative overflow-hidden bg-neutral-950">
          {/* Animated background */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${colors.primary[500]}10, transparent 70%)`,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          <div className="container relative z-10">
            {/* Header with scroll reveal */}
            <motion.div
              className="text-center max-w-2xl mx-auto mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.h2
                className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg"
                animate={{
                  textShadow: [
                    `0 0 10px ${colors.primary[500]}, 0 0 20px ${colors.accent[500]}`,
                    `0 0 20px ${colors.primary[500]}, 0 0 30px ${colors.accent[500]}`,
                    `0 0 10px ${colors.primary[500]}, 0 0 20px ${colors.accent[500]}`,
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                Our Core Values
              </motion.h2>
              <p className="text-white font-semibold drop-shadow-md">
                Built on three pillars: security, anonymity, and transparency
              </p>
            </motion.div>

            {/* Features Grid with 3D hover tilt */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15 },
                },
              }}
            >
              {features.map((feature, i) => {
                const Icon = feature.icon;
                const tilt = useMouseTilt();
                
                return (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
                    }}
                    className="group"
                  >
                    <motion.div
                      className={`h-full p-8 rounded-2xl border border-neutral-700/50 bg-gradient-to-br ${feature.color} to-neutral-800/50 backdrop-blur-sm overflow-hidden relative cursor-pointer`}
                      onMouseMove={tilt.handleMouseMove}
                      onMouseLeave={tilt.handleMouseLeave}
                      style={{
                        rotateX: tilt.y,
                        rotateY: tilt.x,
                        transformStyle: "preserve-3d",
                      }}
                      whileHover={{
                        borderColor: `${colors.primary[500]}80`,
                        boxShadow: `0 20px 50px ${colors.primary[500]}30`,
                        scale: 1.05,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Hover glow background */}
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `radial-gradient(circle at 50% 0%, ${colors.primary[500]}20, transparent 80%)`,
                        }}
                      />

                      <div className="relative z-10">
                        {/* Icon with rotation microinteraction */}
                        <motion.div
                          className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/20 flex items-center justify-center mb-6"
                          whileHover={{
                            scale: 1.2,
                            rotate: -15,
                            boxShadow: `0 0 30px ${colors.primary[500]}`,
                          }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Icon className="h-7 w-7 text-blue-400" />
                        </motion.div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-white mb-4 drop-shadow-md">{feature.title}</h3>

                        {/* Description */}
                        <p className="text-white font-medium leading-relaxed drop-shadow-sm">{feature.description}</p>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* 4️⃣ "HOW IT WORKS" - SCROLL-TRIGGERED KINETIC ANIMATION */}
        {/* ════════════════════════════════════════════════════════════ */}
        <section ref={scrollRef} className="py-24 relative">
          <div className="container">
            {/* Header with scroll reveal */}
            <motion.div
              className="text-center max-w-2xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.h2
                className="text-4xl md:text-5xl font-black text-transparent bg-clip-text mb-4 drop-shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.accent[500]}, ${colors.secondary[500]}, ${colors.primary[500]})`,
                  backgroundSize: "300% 100%",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                How It Works
              </motion.h2>
              <p className="text-black font-bold drop-shadow-md">4 simple steps to cast your vote securely</p>
            </motion.div>

            {/* Progress bar with scroll tracking */}
            <motion.div
              className="h-1 bg-neutral-800 rounded-full mb-12 overflow-hidden max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 origin-left"
                style={{ scaleX: scrollYProgress }}
              />
            </motion.div>

            {/* Steps with staggered scroll reveal */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15 },
                },
              }}
            >
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, x: -20, rotateY: -45 },
                    visible: { 
                      opacity: 1, 
                      x: 0, 
                      rotateY: 0,
                      transition: { duration: 0.8, ease: "easeOut" } 
                    },
                  }}
                  className="relative"
                  style={{ perspective: 1000 }}
                >
                  {/* Connector line with animation */}
                  {i < steps.length - 1 && (
                    <motion.div
                      className="hidden lg:block absolute top-16 left-[calc(100%+1rem)] w-12 h-1 bg-gradient-to-r from-blue-500 to-transparent origin-left"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.15 }}
                    />
                  )}

                  {/* Step card with microinteractions */}
                  <motion.div
                    className="p-8 rounded-xl border border-neutral-400/50 bg-neutral-300/80 backdrop-blur-sm group"
                    whileHover={{
                      borderColor: colors.primary[500],
                      boxShadow: `0 0 30px ${colors.primary[500]}40`,
                      y: -12,
                      backgroundColor: "rgba(229, 231, 235, 1)",
                      scale: 1.05,
                    }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                  >
                    {/* Step number with pulse animation */}
                    <motion.div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg"
                      whileHover={{
                        scale: 1.2,
                        rotate: 15,
                        boxShadow: `0 0 30px ${colors.primary[500]}`,
                      }}
                      animate={{
                        boxShadow: [
                          `0 0 10px ${colors.primary[500]}`,
                          `0 0 20px ${colors.primary[500]}`,
                          `0 0 10px ${colors.primary[500]}`,
                        ]
                      }}
                      transition={{
                        boxShadow: { duration: 2, repeat: Infinity },
                      }}
                    >
                      {step.number}
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-black mb-2 drop-shadow-md">{step.title}</h3>

                    {/* Description */}
                    <p className="text-black font-medium text-sm drop-shadow-sm">{step.description}</p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* 5️⃣ LIVE STATS / IMPACT - SCROLL-TRIGGERED 3D CARDS */}
        {/* ════════════════════════════════════════════════════════════ */}
        <section ref={statsRef} className="py-24 relative overflow-hidden bg-gradient-to-b from-neutral-900/50 to-neutral-950">
          {/* Liquid motion background */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(ellipse at 50% 100%, ${colors.primary[500]}40, transparent 60%)`,
              }}
            />
          </motion.div>

          <div className="container relative z-10">
            {/* Header with kinetic typography */}
            <motion.div
              className="text-center max-w-2xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.h2
                className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg"
                animate={{
                  textShadow: [
                    `0 0 20px ${colors.primary[500]}40`,
                    `0 0 40px ${colors.primary[500]}80`,
                    `0 0 20px ${colors.primary[500]}40`,
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <KineticText text="Real Impact, Real Numbers" />
              </motion.h2>
              <p className="text-white font-semibold drop-shadow-md">
                Trusted by electoral bodies worldwide
              </p>
            </motion.div>

            {/* Stats Cards with scroll-triggered 3D */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.2 },
                },
              }}
            >
              {liveStats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, scale: 0.6, rotateY: -45 },
                    visible: { 
                      opacity: 1, 
                      scale: 1, 
                      rotateY: 0,
                      transition: { duration: 0.8, type: "spring", stiffness: 100 } 
                    },
                  }}
                  style={{ perspective: 1000 }}
                >
                  <motion.div
                    className="p-8 rounded-xl border border-neutral-700/50 bg-neutral-800/30 backdrop-blur-sm text-center"
                    whileHover={{
                      boxShadow: `0 20px 60px ${colors.primary[500]}60`,
                      scale: 1.08,
                      rotateY: 5,
                    }}
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    }}
                  >
                    <motion.div
                      className="text-5xl md:text-6xl font-black mb-3"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.accent[500]})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    >
                      <AnimatedCounter value={parseInt(stat.value)} />
                      {stat.value.replace(/[0-9]/g, "")}
                    </motion.div>
                    <motion.p 
                      className="text-white font-bold drop-shadow-md"
                      animate={{
                        color: [
                          "#ffffff",
                          `${colors.primary[300]}`,
                          "#ffffff",
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                    >
                      {stat.label}
                    </motion.p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* 6️⃣ FINAL CTA - WITH LIQUID MOTION & MICROINTERACTIONS */}
        {/* ════════════════════════════════════════════════════════════ */}
        <section className="py-32 relative overflow-hidden bg-gradient-to-br from-neutral-950 via-blue-950/20 to-neutral-950">
          {/* Liquid blobs background */}
          <LiquidBlobComponent />

          {/* Animated glow orbs */}
          <motion.div
            className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, ${colors.primary[500]}30, transparent)`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2],
              x: [0, 50, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute bottom-0 -left-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, ${colors.accent[500]}20, transparent)`,
            }}
            animate={{
              scale: [1, 0.8, 1],
              opacity: [0.1, 0.3, 0.1],
              x: [0, -80, 0],
              y: [0, 60, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          <div className="container relative z-10">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <motion.h2
                className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight drop-shadow-lg"
                animate={{
                  scale: [1, 1.02, 1],
                  textShadow: [
                    `0 0 30px ${colors.primary[500]}40`,
                    `0 0 60px ${colors.accent[500]}60`,
                    `0 0 30px ${colors.primary[500]}40`,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Ready to Secure Your Vote?
              </motion.h2>

              <motion.p 
                className="text-xl text-white font-semibold mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md"
                animate={{
                  opacity: [1, 0.9, 1],
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                Join millions of citizens voting securely and anonymously with the world's most advanced electoral platform.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Link to="/register">
                  <MagneticButton
                    className="relative px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl text-lg shadow-2xl hover:shadow-blue-500/50 transition-all inline-flex items-center gap-3 group overflow-hidden"
                    intensity={0.5}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <motion.span
                        animate={{
                          rotate: [0, 20, -20, 0],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Zap className="h-5 w-5" />
                      </motion.span>
                      Cast Your Vote Now
                      <motion.span
                        animate={{ x: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.span>
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                      initial={{ x: "100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </MagneticButton>
                </Link>
              </motion.div>

              {/* Floating pulse glows */}
              <motion.div
                className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${colors.accent[500]}20, transparent)`,
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.div
                className="absolute top-20 -left-20 w-32 h-32 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${colors.primary[500]}15, transparent)`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.15, 0.25, 0.15],
                  x: [0, -30, 0],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
            </motion.div>
          </div>
        </section>
      </Layout>
    </PageWrapper>
  );
}
