
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { useToast } from "@/hooks/use-toast";
import { castSecureVote } from "@/services/voteService";
import {
  CheckCircle2,
  ArrowRight,
  Vote,
  FileCheck,
  KeyRound,
  ShieldCheck,
  Loader2,
} from "lucide-react";

// In a real production app, you'd fetch this from the backend based on electionId
const candidates = [
  {
    id: "1",
    name: "Sarah Mitchell",
    party: "Progressive Alliance",
    image: "SM",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "2",
    name: "James Anderson",
    party: "Conservative Union",
    image: "JA",
    color: "bg-red-100 text-red-800",
  },
  {
    id: "3",
    name: "Maria Santos",
    party: "Democratic Center",
    image: "MS",
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "4",
    name: "Robert Chen",
    party: "Green Future",
    image: "RC",
    color: "bg-green-100 text-green-800",
  },
];

export default function VotingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { electionId } = useParams<{ electionId: string }>();

  const [step, setStep] = useState<"select" | "confirm" | "complete">("select");
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null,
  );
  const [votePin, setVotePin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState({ txId: "", timestamp: "" });

  useIdleTimer(60); // Security timeout

  useEffect(() => {
    const token = localStorage.getItem("voterToken");
    if (!token && step !== "complete") {
      navigate("/login");
    }
  }, [navigate, step]);

  const handleSubmitVote = async () => {
    if (!electionId) return;

    const token = localStorage.getItem("voterToken");

    if (!selectedCandidate || votePin.length < 4) {
      toast({
        variant: "destructive",
        title: "Action Required",
        description: "Select a candidate and enter your secure PIN.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Security Validation of Token
      if (!token || token.length < 20 || /^\d+$/.test(token)) {
        throw new Error("Invalid session. Please login again.");
      }

      const candidateName =
        candidates.find((c) => c.id === selectedCandidate)?.name || "";

      // Payload: (electionId, vote, encryptionKey/PIN)
      const result = await castSecureVote(electionId, candidateName, votePin);

      if (result.success) {
        // Clear sensitive session data immediately after vote
        localStorage.removeItem("voterToken");

        setReceiptData({
          txId: result.receipt,
          timestamp: new Date().toLocaleString(),
        });

        setStep("complete");
        toast({
          title: "Vote Recorded",
          description:
            "Your ballot has been encrypted and added to the ledger.",
        });
      } else {
        throw new Error(
          result.message || "The voting server rejected the ballot.",
        );
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Voting Failed",
        description: error.message || "Could not connect to service.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "complete") {
    return (
      <PageWrapper>
        <Layout>
          <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center py-12 px-4">
            <div className="bg-white max-w-lg w-full p-10 rounded-2xl shadow-xl border-t-8 border-green-600 text-center animate-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Vote Confirmed
              </h1>
              <p className="text-neutral-500 mb-8">
                Your anonymous ballot is now immutable.
              </p>

              <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-xl mb-8 text-left space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block tracking-widest">
                    Digital Receipt (SHA-256)
                  </span>
                  <span className="font-mono text-[11px] break-all font-bold text-[#800020]">
                    {receiptData.txId}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest">
                    Time Registered
                  </span>
                  <span className="font-mono text-sm font-bold text-neutral-900">
                    {receiptData.timestamp}
                  </span>
                </div>
              </div>

              <Button
                className="w-full bg-[#800020] hover:bg-[#600018] text-white py-6 font-bold rounded-xl transition-all"
                onClick={() => navigate("/")}
              >
                Finish & Logout
              </Button>
            </div>
          </div>
        </Layout>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Layout>
        <div className="min-h-screen bg-[#F8F9FA] py-12 px-4">
          <div className="container max-w-2xl">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="bg-[#800020] px-8 py-6">
                <h2 className="text-white font-bold text-xl flex items-center gap-3">
                  {step === "select" ? (
                    <>
                      <Vote className="h-6 w-6" /> Official Ballot
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-6 w-6" /> Confirm Selection
                    </>
                  )}
                </h2>
                <p className="text-red-100/70 text-sm mt-1">
                  Election ID: {electionId?.substring(0, 12)}...
                </p>
              </div>

              <div className="p-8">
                {step === "select" ? (
                  <div className="space-y-4">
                    {candidates.map((candidate) => (
                      <button
                        key={candidate.id}
                        onClick={() => setSelectedCandidate(candidate.id)}
                        className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left ${
                          selectedCandidate === candidate.id
                            ? "border-[#800020] bg-red-50/30"
                            : "border-neutral-100 hover:border-neutral-200"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-sm ${candidate.color}`}
                        >
                          {candidate.image}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-lg text-neutral-900">
                            {candidate.name}
                          </p>
                          <p className="text-sm text-neutral-500 font-medium">
                            {candidate.party}
                          </p>
                        </div>
                        {selectedCandidate === candidate.id && (
                          <CheckCircle2 className="text-[#800020] h-6 w-6" />
                        )}
                      </button>
                    ))}
                    <Button
                      onClick={() => setStep("confirm")}
                      disabled={!selectedCandidate}
                      className="w-full mt-6 bg-[#800020] hover:bg-[#600018] py-7 text-lg rounded-xl shadow-lg shadow-red-900/10"
                    >
                      Review Ballot <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 text-center">
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
                        You are voting for
                      </p>
                      <h3 className="text-2xl font-black text-neutral-900 uppercase">
                        {
                          candidates.find((c) => c.id === selectedCandidate)
                            ?.name
                        }
                      </h3>
                      <p className="text-[#800020] font-bold text-sm">
                        {
                          candidates.find((c) => c.id === selectedCandidate)
                            ?.party
                        }
                      </p>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-bold text-neutral-700 flex items-center gap-2 px-1">
                        <KeyRound size={16} className="text-[#800020]" /> Secret
                        Voting PIN
                      </label>
                      <input
                        type="password"
                        value={votePin}
                        onChange={(e) => setVotePin(e.target.value)}
                        placeholder="Enter 4-6 digit PIN"
                        className="w-full p-5 bg-neutral-50 border-2 border-neutral-100 rounded-2xl text-center text-3xl tracking-[1em] focus:border-[#800020] focus:ring-0 transition-all outline-none"
                      />
                      <p className="text-[10px] text-neutral-400 text-center px-4">
                        This PIN is used as a local encryption key. Your actual
                        vote is never sent in plain text.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="ghost"
                        onClick={() => setStep("select")}
                        className="flex-1 py-7 rounded-xl font-bold"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmitVote}
                        disabled={isSubmitting || votePin.length < 4}
                        className="flex-2 grow bg-green-600 hover:bg-green-700 text-white py-7 rounded-xl font-bold shadow-lg shadow-green-900/10"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin mr-2" /> Signing...
                          </>
                        ) : (
                          "Confirm & Cast Vote"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </PageWrapper>
  );
}
