import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import {
  Shield,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Vote,
  Lock,
  AlertTriangle,
  FileCheck,
  Flag,
  Fingerprint,
  RefreshCw,
  Server,
  FileKey
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const candidates = [
  { id: "1", name: "Sarah Mitchell", party: "Progressive Alliance", image: "SM", color: "bg-primary-100 text-primary-800" },
  { id: "2", name: "James Anderson", party: "Conservative Union", image: "JA", color: "bg-red-100 text-red-800" },
  { id: "3", name: "Maria Santos", party: "Democratic Center", image: "MS", color: "bg-purple-100 text-purple-800" },
  { id: "4", name: "Robert Chen", party: "Green Future", image: "RC", color: "bg-green-100 text-green-800" },
];

export default function VotingPage() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"select" | "confirm" | "encrypting" | "anonymizing" | "complete">("select");
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  // Animation States
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [anonymizationStep, setAnonymizationStep] = useState(0);

  const handleSubmitVote = async () => {
    // Step 1: Encryption Animation
    setStep("encrypting");

    // Simulate Encryption Progress
    const encryptInterval = setInterval(() => {
      setEncryptionProgress(prev => {
        if (prev >= 100) {
          clearInterval(encryptInterval);
          // Move to next step after small pause
          setTimeout(() => startAnonymization(), 800);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const startAnonymization = () => {
    setStep("anonymizing");
    // Sequence of visual steps for anonymity
    // 0: Start
    // 1: Detach ID
    // 2: Shuffle
    // 3: Complete
    let currentStep = 0;
    const anonInterval = setInterval(() => {
      currentStep++;
      setAnonymizationStep(currentStep);
      if (currentStep >= 3) {
        clearInterval(anonInterval);
        setTimeout(() => finishVoting(), 1000);
      }
    }, 1200);
  };

  const finishVoting = () => {
    setStep("complete");
    toast({
      title: "Vote Recorded",
      description: "Your ballot has been encrypted and stored on the immutable ledger."
    });
  };

  if (step === "complete") {
    return (
      <PageWrapper>
        <Layout>
          <div className="min-h-[80vh] bg-neutral-100 flex items-center justify-center py-12 px-4">
            <div className="bg-white max-w-lg w-full p-10 rounded-sm shadow-xl border-t-8 border-green-600 text-center relative overflow-hidden animate-in zoom-in-95 duration-500">
              {/* Background Watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                <Shield className="h-[400px] w-[400px] text-neutral-900" />
              </div>

              <div className="w-28 h-28 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 border-4 border-green-100 shadow-inner animate-in slide-in-from-bottom-5 duration-700">
                <CheckCircle2 className="h-14 w-14 text-green-600" />
              </div>

              <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">Vote Recorded</h1>
              <p className="text-neutral-500 mb-8 font-medium">
                Official Ballot Receipt
              </p>

              <div className="bg-slate-50 border border-slate-200 p-6 rounded-sm mb-8 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500 rotate-45 translate-x-10 -translate-y-10" />

                <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Transaction Hash</span>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-200 px-2 py-1 rounded">0x8F3a...2A9c</span>
                </div>
                <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Timestamp</span>
                  <span className="font-mono text-sm font-bold text-slate-900">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded border border-slate-100 shadow-sm">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Integrity Check</span>
                  <span className="text-xs font-bold text-green-700 flex items-center gap-1.5 uppercase">
                    <Shield className="h-3.5 w-3.5 fill-current" /> Verified Immutable
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button className="w-full bg-slate-900 hover:bg-black text-white py-6 uppercase font-bold tracking-wide rounded-sm shadow-lg hover:shadow-xl transition-all" onClick={() => navigate("/dashboard/voter")}>
                  Return to Dashboard
                </Button>
                <Button variant="ghost" className="text-neutral-500 hover:text-neutral-900 text-sm">
                  <FileKey className="h-4 w-4 mr-2" /> Download Cryptographic Proof
                </Button>
              </div>
            </div>
          </div>
        </Layout>
      </PageWrapper>
    );
  }

  // Animation Components
  if (step === "encrypting") {
    return (
      <PageWrapper>
        <Layout>
          <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-white text-center">
            <div className="w-full max-w-md">
              <div className="mb-8 relative">
                <Lock className={`h-24 w-24 mx-auto mb-6 text-emerald-400 transition-all duration-500 ${encryptionProgress === 100 ? 'scale-110 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'scale-100'}`} />
                {encryptionProgress < 100 && (
                  <RefreshCw className="h-24 w-24 absolute top-0 left-1/2 -translate-x-1/2 animate-spin text-emerald-500/30" />
                )}
              </div>

              <h2 className="text-2xl font-bold mb-2 tracking-tight">Encrypting Ballot</h2>
              <p className="text-slate-400 mb-8 max-w-xs mx-auto text-sm">
                Generating zero-knowledge proof and securing your selection with AES-256 encryption.
              </p>

              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-2 border border-slate-700">
                <div
                  className="h-full bg-emerald-500 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  style={{ width: `${encryptionProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-mono text-emerald-500/80">
                <span>init_hash()</span>
                <span>{encryptionProgress}%</span>
              </div>
            </div>
          </div>
        </Layout>
      </PageWrapper>
    );
  }

  if (step === "anonymizing") {
    return (
      <PageWrapper>
        <Layout>
          <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-white text-center">
            <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-3 items-center gap-8 mb-12">

              {/* User Identity Node */}
              <div className={`flex flex-col items-center transition-all duration-700 ${anonymizationStep >= 1 ? 'opacity-30 scale-90 blur-sm' : 'opacity-100 scale-100'}`}>
                <div className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mb-4">
                  <Fingerprint className="h-10 w-10 text-blue-400" />
                </div>
                <p className="text-sm font-bold text-blue-200">Your Identity</p>
              </div>

              {/* Arrow / Connection */}
              <div className="flex items-center justify-center relative h-12">
                {anonymizationStep === 0 && (
                  <div className="h-1 w-full bg-slate-700" />
                )}
                {anonymizationStep === 1 && (
                  <div className="absolute flex gap-1">
                    <span className="block w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span className="text-xs text-red-400 font-mono uppercase">Severing Link</span>
                  </div>
                )}
                {anonymizationStep >= 2 && (
                  <div className="text-xs text-green-500 font-bold border border-green-500/50 px-3 py-1 rounded bg-green-500/10">
                    ANONYMIZED
                  </div>
                )}
              </div>

              {/* Vote Data Node */}
              <div className={`flex flex-col items-center transition-all duration-700 ${anonymizationStep >= 2 ? 'scale-110' : 'scale-100'}`}>
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <FileKey className="h-10 w-10 text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-emerald-200">Encrypted Vote</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">
              {anonymizationStep === 0 && "Verifying Eligibility..."}
              {anonymizationStep === 1 && "Separating Identity from Ballot..."}
              {anonymizationStep >= 2 && "Submitting Anonymous Token..."}
            </h2>
            <div className="flex gap-2 justify-center">
              <div className={`w-3 h-3 rounded-full transition-colors ${anonymizationStep >= 1 ? 'bg-blue-500' : 'bg-slate-700'}`} />
              <div className={`w-3 h-3 rounded-full transition-colors ${anonymizationStep >= 2 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
              <div className={`w-3 h-3 rounded-full transition-colors ${anonymizationStep >= 3 ? 'bg-white' : 'bg-slate-700'}`} />
            </div>
          </div>
        </Layout>
      </PageWrapper>
    )
  }

  // STANDARD VIEW (Selection & Confirmation)
  return (
    <PageWrapper>
      <Layout>
        <div className="min-h-screen bg-neutral-100 py-12 px-4">
          <div className="container max-w-3xl">

            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white p-6 rounded-sm shadow-sm border border-neutral-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-50 rounded-full">
                  <Flag className="h-6 w-6 text-primary-700" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900 uppercase">Presidential General Election</h1>
                  <p className="text-neutral-500 text-sm">Official Digital Ballot 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-full border border-neutral-200">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-xs font-bold uppercase text-neutral-600">Secure & Anonymous</span>
              </div>
            </div>

            <div className="bg-white rounded-sm shadow-md border border-neutral-200 overflow-hidden">
              <div className="bg-primary-900 px-6 py-4 border-b border-primary-800">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  {step === "select" ? (
                    <>
                      <Vote className="h-5 w-5 text-accent-400" /> Select Candidate
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-5 w-5 text-accent-400" /> Review & Confirm
                    </>
                  )}
                </h2>
              </div>

              <div className="p-6 md:p-8">
                {step === "select" && (
                  <>
                    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
                      <p className="text-sm text-yellow-800 font-medium">
                        Please select one candidate from the list below. You will have a chance to review your choice before final submission.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {candidates.map((candidate) => (
                        <button
                          key={candidate.id}
                          onClick={() => setSelectedCandidate(candidate.id)}
                          className={`w-full group relative flex items-center gap-4 p-4 rounded-sm border-2 transition-all text-left ${selectedCandidate === candidate.id
                            ? "border-primary-700 bg-primary-50/50"
                            : "border-neutral-200 hover:border-primary-400 bg-white"
                            }`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedCandidate === candidate.id ? "border-primary-700" : "border-neutral-300 group-hover:border-primary-400"
                            }`}>
                            {selectedCandidate === candidate.id && <div className="w-3 h-3 bg-primary-700 rounded-full" />}
                          </div>

                          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${candidate.color}`}>
                            {candidate.image}
                          </div>

                          <div className="flex-1">
                            <p className={`font-bold text-lg ${selectedCandidate === candidate.id ? "text-primary-900" : "text-neutral-900"
                              }`}>{candidate.name}</p>
                            <p className="text-sm text-neutral-500">{candidate.party}</p>
                          </div>

                          {selectedCandidate === candidate.id && (
                            <div className="px-3 py-1 bg-primary-700 text-white text-xs font-bold uppercase rounded-sm">
                              Selected
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-end mt-8 border-t border-neutral-100 pt-6">
                      <Button
                        onClick={() => setStep("confirm")}
                        disabled={!selectedCandidate}
                        className="bg-primary-900 hover:bg-black text-white px-8 py-6 rounded-sm uppercase font-bold tracking-wide disabled:opacity-50"
                      >
                        Review Selection <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </>
                )}

                {step === "confirm" && (
                  <>
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-200">
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-neutral-900 mb-2">Confirm Your Ballot</h2>
                      <p className="text-neutral-500">
                        Please verify your selection below. Once submitted, your vote is final and cannot be changed.
                      </p>
                    </div>

                    <div className="max-w-md mx-auto bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-sm p-6 mb-8 text-center">
                      <p className="text-xs font-bold uppercase text-neutral-400 mb-2">You have selected</p>

                      <div className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4 bg-white border border-neutral-200 shadow-sm">
                        {candidates.find((c) => c.id === selectedCandidate)?.image}
                      </div>

                      <h3 className="text-2xl font-display font-bold text-neutral-900">
                        {candidates.find((c) => c.id === selectedCandidate)?.name}
                      </h3>
                      <p className="text-neutral-600 font-medium mt-1">
                        {candidates.find((c) => c.id === selectedCandidate)?.party}
                      </p>
                    </div>

                    <div className="flex gap-4 justify-center border-t border-neutral-100 pt-8">
                      <Button variant="outline" className="flex-1 max-w-[200px] border-neutral-300 text-neutral-600 hover:bg-neutral-100 uppercase font-bold tracking-wide py-6 rounded-sm" onClick={() => setStep("select")}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Change
                      </Button>
                      <Button className="flex-1 max-w-[200px] bg-green-700 hover:bg-green-800 text-white uppercase font-bold tracking-wide py-6 rounded-sm shadow-md" onClick={handleSubmitVote} >
                        <Lock className="h-4 w-4 mr-2" /> Confirm Vote
                      </Button>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200">
                <p className="text-xs text-center text-neutral-400">
                  SecureVote System v2.0 • Authorized by National Electoral Commission
                </p>
              </div>

            </div>
          </div>
        </div>
      </Layout>
    </PageWrapper>
  );
}
