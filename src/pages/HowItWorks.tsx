import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { PageWrapper } from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import {
    Shield,
    Lock,
    FileCheck,
    Vote,
    UserCheck,
    KeyRound,
    ScanFace,
    Send,
    BadgeCheck,
    Eye,
    EyeOff,
    Database,
    ShieldCheck,
    Users,
    Gavel,
    Search,
    Server,
    ArrowRight,
    ChevronRight,
    Fingerprint,
    Binary,
    Blocks,
    CircleDot,
} from "lucide-react";

/* ─── Animated Section Wrapper ─── */
function AnimatedSection({
    children,
    className = "",
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-120px" });
    return (
        <motion.section
            ref={ref}
            initial={{ opacity: 0, y: 80 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
            transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.section>
    );
}

/* ─── Data ─── */
const processSteps = [
    {
        icon: UserCheck,
        title: "Voter Registration",
        description:
            "Citizens register through a secure portal using government-issued identification. Your data is protected during transit and at rest, and raw identity documents are never stored in the system.",
        detail: "Encrypted data transfer · Government ID verification",
    },
    {
        icon: ScanFace,
        title: "Identity Verification",
        description:
            "Multi-factor authentication ensures only the registered voter can access their ballot. Each login session is uniquely secured and time-limited to prevent unauthorized access.",
        detail: "Multi-factor authentication · Time-limited sessions",
    },
    {
        icon: KeyRound,
        title: "Secure Ballot Access",
        description:
            "Once verified, you are granted secure access to your ballot. The system ensures that only authorized election infrastructure can process your vote while keeping your choice completely private.",
        detail: "Secure access control · Ballot secrecy guaranteed",
    },
    {
        icon: Vote,
        title: "Private Vote Casting",
        description:
            "Select your candidate on a clean, accessible interface. Your vote is fully encrypted before leaving your device, ensuring ballot secrecy at every stage of the process.",
        detail: "Device-level encryption · Private ballot rendering",
    },
    {
        icon: Send,
        title: "Secure Submission & Tamper-Proof Logging",
        description:
            "Your encrypted vote is securely transmitted and recorded in a tamper-proof ledger. Once logged, no individual record can be altered without detection — guaranteeing the integrity of every ballot.",
        detail: "Secure transmission · Immutable record keeping",
    },
    {
        icon: BadgeCheck,
        title: "Verification Receipt",
        description:
            "After casting your vote, you receive a digital receipt that lets you confirm your ballot was counted — without revealing your choice to anyone. This enables independent auditing of election results.",
        detail: "Verifiable receipt · Privately cast, publicly auditable",
    },
];

const securityFeatures = [
    {
        icon: Binary,
        title: "Encrypted Vote Counting",
        description:
            "Votes are tallied without ever exposing individual ballot choices. The counting process is designed so that your vote remains completely private throughout — from casting to final results.",
        color: "text-primary-700",
        bgColor: "bg-primary-50",
        borderColor: "border-primary-200",
    },
    {
        icon: Fingerprint,
        title: "Ballot Authenticity",
        description:
            "Every ballot is digitally verified to confirm it is genuine and has not been altered. This prevents forgery and ensures that only valid, authorized ballots are included in the final count.",
        color: "text-emerald-700",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
    },
    {
        icon: Blocks,
        title: "Tamper-Proof Record Keeping",
        description:
            "Every vote is recorded in an immutable ledger. Once a ballot is logged, any attempt to alter it would be immediately detected — providing an unbreakable chain of electoral integrity.",
        color: "text-amber-700",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
    },
    {
        icon: CircleDot,
        title: "Privacy-Preserving Verification",
        description:
            "Voters can confirm their vote was counted correctly, and observers can verify the overall tally — all without anyone being able to see how any individual voted. Transparency and privacy, together.",
        color: "text-violet-700",
        bgColor: "bg-violet-50",
        borderColor: "border-violet-200",
    },
];

const stakeholders = [
    {
        icon: Users,
        title: "Voters",
        description:
            "Register, authenticate, cast encrypted ballots, and receive verifiable receipts. Full anonymity guaranteed — no link between identity and ballot choice is ever stored.",
        permissions: ["Cast one ballot per election", "Receive verification receipt", "View published results"],
    },
    {
        icon: ShieldCheck,
        title: "Election Administrators",
        description:
            "Configure elections, manage candidate lists, set voting windows, and initiate the encrypted tally. Cannot view individual ballots or voter choices.",
        permissions: ["Create & manage elections", "Publish results", "Cannot decrypt individual votes"],
    },
    {
        icon: Eye,
        title: "Observers",
        description:
            "Independent bodies with read-only access to the blockchain ledger and aggregated statistics. Can verify tally correctness through zero-knowledge proofs without accessing raw ballot data.",
        permissions: ["View blockchain ledger", "Verify tally proofs", "Monitor in real-time"],
    },
    {
        icon: Search,
        title: "Auditors",
        description:
            "Conduct post-election forensic analysis. Access audit logs, hash-chain verification tools, and recount mechanisms. Every action is itself logged for accountability.",
        permissions: ["Forensic log access", "Hash-chain verification", "Recount initiation"],
    },
    {
        icon: Server,
        title: "System Operators",
        description:
            "Maintain infrastructure, monitor uptime, and manage deployments. Operate under the principle of least privilege — no access to ballot data or election configuration.",
        permissions: ["Infrastructure monitoring", "Zero access to ballot data", "Security patching"],
    },
];

/* ─── Page Component ─── */
export default function HowItWorks() {
    const navigate = useNavigate();

    return (
        <PageWrapper>
            <Layout>
                <div className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-primary-100">

                    {/* ══════════════════════ HERO ══════════════════════ */}
                    <section className="relative bg-neutral-900 text-white overflow-hidden">
                        {/* Decorative grid background */}
                        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:60px_60px]" />
                        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary-800/20 blur-[120px]" />
                        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-primary-600/10 blur-[100px]" />

                        <div className="container relative z-10 mx-auto px-6 max-w-7xl py-28 md:py-36 text-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6 }}
                                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-700/20 border border-primary-600/30 mb-8"
                            >
                                <Shield className="h-10 w-10 text-primary-400" />
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.15 }}
                                className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight leading-tight"
                            >
                                How SecureVote{" "}
                                <span className="text-primary-400">Works</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="text-lg md:text-xl text-neutral-400 max-w-3xl mx-auto leading-relaxed"
                            >
                                A transparent look into the cryptographic, architectural, and procedural
                                safeguards that make every vote secure, anonymous, and independently verifiable.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6, duration: 1 }}
                                className="mt-12 flex items-center justify-center gap-8 text-xs font-bold uppercase tracking-widest text-neutral-500"
                            >
                                {["End-to-End Encrypted", "Publicly Auditable", "Voter Anonymous"].map(
                                    (label, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            {label}
                                        </div>
                                    )
                                )}
                            </motion.div>
                        </div>

                        {/* Clean bottom edge */}
                    </section>

                    {/* ══════════════════════ PROCESS TIMELINE ══════════════════════ */}
                    <AnimatedSection className="py-24 bg-primary-50 relative">
                        <div className="container mx-auto px-6 max-w-7xl">
                            <div className="text-center mb-20">
                                <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-700 mb-3">
                                    The Voting Process
                                </span>
                                <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
                                    From Registration to Verification
                                </h2>
                                <p className="text-neutral-500 max-w-2xl mx-auto">
                                    Six cryptographically secured stages ensure your vote is cast privately,
                                    transmitted securely, and counted accurately.
                                </p>
                            </div>

                            <div className="relative">
                                {/* Vertical line */}
                                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary-200 via-primary-300 to-primary-100 hidden md:block" />
                                <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary-200 via-primary-300 to-primary-100 md:hidden" />

                                <div className="space-y-12 md:space-y-16">
                                    {processSteps.map((step, i) => {
                                        const isLeft = i % 2 === 0;
                                        return (
                                            <AnimatedSection key={i} delay={i * 0.08}>
                                                <div className={`flex items-start gap-6 md:gap-0 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>
                                                    {/* Content */}
                                                    <div className={`flex-1 pl-14 md:pl-0 ${isLeft ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                                                        <div className={`inline-flex items-center gap-2 mb-3 ${isLeft ? "md:flex-row-reverse" : ""}`}>
                                                            <span className="text-xs font-bold uppercase tracking-widest text-primary-600">
                                                                Step {String(i + 1).padStart(2, "0")}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-xl font-bold text-neutral-900 mb-3">
                                                            {step.title}
                                                        </h3>
                                                        <p className="text-neutral-600 leading-relaxed mb-3">
                                                            {step.description}
                                                        </p>
                                                        <p className="text-xs font-mono text-neutral-400 tracking-wide">
                                                            {step.detail}
                                                        </p>
                                                    </div>

                                                    {/* Center node */}
                                                    <div className="absolute left-4 md:relative md:left-auto flex-shrink-0 z-10">
                                                        <div className="w-9 h-9 rounded-full bg-primary-700 text-white flex items-center justify-center shadow-lg shadow-primary-700/20 ring-4 ring-white">
                                                            <step.icon className="h-4 w-4" />
                                                        </div>
                                                    </div>

                                                    {/* Spacer for alternating layout */}
                                                    <div className="hidden md:block flex-1" />
                                                </div>
                                            </AnimatedSection>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* ══════════════════════ SECURITY ARCHITECTURE ══════════════════════ */}
                    <AnimatedSection className="py-24 bg-white relative">
                        <div className="container mx-auto px-6 max-w-7xl">
                            <div className="text-center mb-16">
                                <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-700 mb-3">
                                    Our Security Promise
                                </span>
                                <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
                                    Security You Can Trust
                                </h2>
                                <p className="text-neutral-500 max-w-2xl mx-auto">
                                    Four layers of protection work together to guarantee your
                                    privacy, ballot authenticity, data integrity, and transparent verifiability.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {securityFeatures.map((feature, i) => (
                                    <AnimatedSection key={i} delay={i * 0.1}>
                                        <div
                                            className={`group relative p-8 bg-white border ${feature.borderColor} rounded-sm hover:shadow-lg transition-all duration-300 h-full`}
                                        >
                                            {/* Decorative corner accent */}
                                            <div className={`absolute top-0 left-0 w-1 h-12 ${feature.bgColor} rounded-br`} />

                                            <div
                                                className={`w-14 h-14 ${feature.bgColor} border ${feature.borderColor} rounded-sm flex items-center justify-center mb-6 ${feature.color} group-hover:scale-105 transition-transform`}
                                            >
                                                <feature.icon className="h-7 w-7" />
                                            </div>
                                            <h3 className="text-xl font-bold text-neutral-900 mb-3">
                                                {feature.title}
                                            </h3>
                                            <p className="text-neutral-600 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </AnimatedSection>
                                ))}
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* ══════════════════════ STAKEHOLDER ROLES ══════════════════════ */}
                    <AnimatedSection className="py-24 bg-neutral-100 relative">
                        <div className="container mx-auto px-6 max-w-7xl">
                            <div className="text-center mb-16">
                                <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-700 mb-3">
                                    Role-Based Access
                                </span>
                                <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
                                    Stakeholders & Permissions
                                </h2>
                                <p className="text-neutral-500 max-w-2xl mx-auto">
                                    Every participant in the electoral process operates under strictly defined
                                    permissions, enforcing the principle of least privilege at every level.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {stakeholders.map((role, i) => (
                                    <AnimatedSection key={i} delay={i * 0.08}>
                                        <div className="group relative flex flex-col h-full p-8 bg-neutral-50 border border-neutral-200 rounded-sm hover:bg-white hover:border-primary-200 hover:shadow-md transition-all duration-300">
                                            <div className="w-12 h-12 bg-white border border-neutral-200 rounded-sm flex items-center justify-center mb-5 text-primary-700 group-hover:border-primary-200 shadow-sm">
                                                <role.icon className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary-900">
                                                {role.title}
                                            </h3>
                                            <p className="text-neutral-600 text-sm leading-relaxed mb-5 flex-1">
                                                {role.description}
                                            </p>
                                            <div className="border-t border-neutral-200 pt-4 space-y-2">
                                                {role.permissions.map((perm, j) => (
                                                    <div key={j} className="flex items-center gap-2 text-xs text-neutral-500">
                                                        <ChevronRight className="h-3 w-3 text-primary-600 flex-shrink-0" />
                                                        <span>{perm}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </AnimatedSection>
                                ))}
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* ══════════════════════ TRUST & TRANSPARENCY ══════════════════════ */}
                    <AnimatedSection className="py-24 bg-neutral-900 text-white relative overflow-hidden">
                        {/* Background decorations */}
                        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
                        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full bg-primary-800/15 blur-[120px]" />
                        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-primary-600/10 blur-[100px]" />

                        <div className="container relative z-10 mx-auto px-6 max-w-7xl">
                            <div className="text-center mb-16">
                                <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-400 mb-3">
                                    Auditability & Resilience
                                </span>
                                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                                    Trust Through Transparency
                                </h2>
                                <p className="text-neutral-400 max-w-2xl mx-auto">
                                    We believe trust is earned through verifiability. Every design decision
                                    prioritizes auditability without compromising voter privacy.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {[
                                    {
                                        icon: Database,
                                        title: "Immutable Audit Trails",
                                        description:
                                            "Every action — from voter authentication to ballot submission — is permanently logged. Records cannot be altered or deleted after the fact, ensuring full accountability.",
                                    },
                                    {
                                        icon: Gavel,
                                        title: "Independent Recount Capability",
                                        description:
                                            "Election results can be independently verified and recomputed by authorized auditors at any time, without compromising the secrecy of any individual ballot.",
                                    },
                                    {
                                        icon: EyeOff,
                                        title: "Threat-Resilient Design",
                                        description:
                                            "The system is built to withstand a wide range of cyber threats and attack scenarios through multiple independent layers of defense-in-depth security.",
                                    },
                                ].map((item, i) => (
                                    <AnimatedSection key={i} delay={i * 0.12}>
                                        <div className="p-8 bg-white/[0.04] border border-white/[0.08] rounded-sm backdrop-blur-sm hover:bg-white/[0.07] transition-all duration-300">
                                            <div className="w-12 h-12 rounded-sm bg-primary-700/20 border border-primary-600/20 flex items-center justify-center mb-6 text-primary-400">
                                                <item.icon className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-lg font-bold text-neutral-100 mb-3">
                                                {item.title}
                                            </h3>
                                            <p className="text-neutral-400 text-sm leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </AnimatedSection>
                                ))}
                            </div>

                            {/* Trust indicators bar */}
                            <AnimatedSection delay={0.4}>
                                <div className="mt-16 p-6 bg-white/[0.03] border border-white/[0.06] rounded-sm">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                                        {[
                                            { label: "Data Protection", value: "Advanced" },
                                            { label: "Vote Integrity", value: "Tamper-Proof" },
                                            { label: "Transmission", value: "Fully Encrypted" },
                                            { label: "Authentication", value: "Multi-Factor" },
                                        ].map((spec, i) => (
                                            <div key={i}>
                                                <p className="text-lg font-bold font-mono text-primary-400 mb-1">
                                                    {spec.value}
                                                </p>
                                                <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                                                    {spec.label}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </AnimatedSection>
                        </div>
                    </AnimatedSection>

                    {/* ══════════════════════ CTA ══════════════════════ */}
                    <AnimatedSection className="py-20 bg-primary-900 text-white text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#800020_1px,transparent_1px)] [background-size:20px_20px]" />
                        <div className="container relative z-10 mx-auto px-6">
                            <Lock className="h-12 w-12 text-primary-400 mx-auto mb-6 opacity-80" />
                            <h2 className="text-3xl font-display font-bold mb-4">
                                Your Vote is Protected
                            </h2>
                            <p className="text-primary-200 mb-8 max-w-xl mx-auto">
                                Modern cryptographic protocols with publicly verifiable results. Complete voter anonymity.
                                Ready to participate in secure democracy?
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    onClick={() => navigate("/register")}
                                    className="h-14 px-8 bg-white text-primary-900 hover:bg-primary-50 font-bold uppercase tracking-wide text-sm rounded-sm shadow-lg"
                                >
                                    Register to Vote <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/login")}
                                    className="h-14 px-8 bg-primary-700 text-white hover:bg-primary-600 font-bold uppercase tracking-wide text-sm rounded-sm shadow-lg border border-primary-500"
                                >
                                    Voter Login
                                </Button>
                            </div>
                        </div>
                    </AnimatedSection>

                </div>
            </Layout>
        </PageWrapper>
    );
}
