import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Vote, CheckCircle, Smartphone, Globe, Lock, ChevronRight, FileCheck, Users, BarChart3, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageWrapper } from "@/components/PageWrapper";
import { motion } from "framer-motion";

const features = [
  {
    icon: Shield,
    title: "Military-Grade Encryption",
    description: "End-to-end cryptographic verification ensures your vote remains immutable and anonymous.",
  },
  {
    icon: Smartphone,
    title: "Biometric Authentication",
    description: "Advanced facial recognition technology verifies voter identity against official government records.",
  },
  {
    icon: Globe,
    title: "Universal Accessibility",
    description: "Secure remote voting access for all citizens, including overseas military and expatriates.",
  },
  {
    icon: FileCheck,
    title: "Verifiable Audit Trails",
    description: "Every vote generates a cryptographic receipt, allowing independent public auditing of election results.",
  },
];

const stats = [
  { value: "100%", label: "Secure & Verified" },
  { value: "250M+", label: "Eligible Voters" },
  { value: "0", label: "Fraud Incidents" },
  { value: "24/7", label: "System Monitoring" },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <Layout>
        <div className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-primary-100">

          {/* HERO SECTION */}
          <section className="relative pt-20 pb-32 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(#800020_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white z-0" />

            <div className="container relative z-10 mx-auto px-6 max-w-7xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 mb-8"
              >
                <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary-800">
                  Official Election System
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-5xl md:text-7xl font-display font-bold text-neutral-900 mb-6 tracking-tight leading-tight"
              >
                Secure. Transparent.<br />
                <span className="text-primary-700">Constitutional.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-neutral-600 max-w-2xl mx-auto mb-10 leading-relaxed"
              >
                The authorized digital platform for national elections. exercising your right to vote with state-of-the-art security and complete transparency.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Button
                  onClick={() => navigate("/login")}
                  className="h-14 px-8 bg-primary-700 hover:bg-primary-800 text-white font-bold uppercase tracking-wide text-sm rounded-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                >
                  Access Voter Portal <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/how-it-works")}
                  className="h-14 px-8 bg-white border-2 border-neutral-200 hover:border-primary-200 text-neutral-700 font-bold uppercase tracking-wide text-sm rounded-sm hover:bg-neutral-50"
                >
                  Learn More
                </Button>
              </motion.div>
            </div>
          </section>

          {/* STATS STRIP */}
          <section className="border-y border-neutral-100 bg-neutral-50">
            <div className="container mx-auto px-6 max-w-7xl">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-200">
                {stats.map((stat, i) => (
                  <div key={i} className="py-8 text-center px-4">
                    <p className="text-3xl md:text-4xl font-display font-bold text-primary-800 mb-1">{stat.value}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FEATURES GRID */}
          <section className="py-24 bg-white">
            <div className="container mx-auto px-6 max-w-7xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-display font-bold text-neutral-900 mb-4">Integrity by Design</h2>
                <p className="text-neutral-500 max-w-2xl mx-auto">
                  Built on principles of zero-trust security and public verified transparency.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {features.map((feature, i) => (
                  <div key={i} className="group p-8 border border-neutral-200 rounded-sm hover:border-primary-200 hover:shadow-md transition-all bg-neutral-50 hover:bg-white">
                    <div className="w-14 h-14 bg-white border border-neutral-200 rounded-sm flex items-center justify-center mb-6 text-primary-700 group-hover:text-primary-800 group-hover:border-primary-200 shadow-sm">
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary-900">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="py-24 bg-neutral-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541872703-74c5963631df?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay" />
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="md:w-1/2">
                  <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Democracy in Your Hands</h2>
                  <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
                    Our streamlined process ensures that every eligible citizen can cast their vote securely in under 2 minutes, from anywhere in the world.
                  </p>
                  <ul className="space-y-4 mb-8">
                    {[
                      "Register with Biometric ID",
                      "Receive Digital Ballot",
                      "Cast Your Private Vote",
                      "Verify with Receipt"
                    ].map((step, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </div>
                        <span className="font-semibold text-neutral-200">{step}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => navigate("/register")}
                    className="bg-white text-neutral-900 hover:bg-neutral-100 font-bold uppercase tracking-wide px-8 py-6 rounded-sm"
                  >
                    Begin Registration
                  </Button>
                </div>
                <div className="md:w-1/2 bg-white/5 border border-white/10 rounded-sm p-8 backdrop-blur-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <Shield className="h-12 w-12 text-primary-500" />
                    <div>
                      <h3 className="font-bold text-xl">State-Level Security</h3>
                      <p className="text-neutral-400 text-sm">Official Protocol</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-sm text-neutral-300">
                    <p>
                      "The SecureVote system represents a paradigm shift in electoral integrity, combining the accessibility of digital platforms with the recoverability of paper ballots."
                    </p>
                    <p className="font-bold text-white mt-4">
                      — National Electoral Commission
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 bg-primary-900 text-white text-center">
            <div className="container mx-auto px-6">
              <Shield className="h-16 w-16 text-primary-400 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl font-display font-bold mb-4">Ready to Exercise Your Right?</h2>
              <p className="text-primary-200 mb-8 max-w-xl mx-auto">
                Registration for the upcoming federal election closes in 48 hours. Ensure your voice is heard.
              </p>
              <Button
                onClick={() => navigate("/register")}
                className="bg-white text-primary-900 hover:bg-primary-50 px-10 py-6 text-lg font-bold uppercase tracking-wide rounded-sm"
              >
                Register Now
              </Button>
            </div>
          </section>

        </div>
      </Layout>
    </PageWrapper>
  );
}
