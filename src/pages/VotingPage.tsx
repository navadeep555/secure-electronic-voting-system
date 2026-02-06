import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { useToast } from "@/hooks/use-toast";
import { castSecureVote } from "@/services/voteService"; // Import the secure service
import {
  Shield,
  CheckCircle2,
  ArrowRight,
  Vote,
  Lock,
  AlertTriangle,
  FileCheck,
  Flag,
  KeyRound,
} from "lucide-react";

const candidates = [
  {
    id: "1",
    name: "Sarah Mitchell",
    party: "Progressive Alliance",
    image: "SM",
    color: "bg-primary-100 text-primary-800",
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

  // US 1.7: Kiosk Idle Timer
  useIdleTimer(60);

  const [step, setStep] = useState<"select" | "confirm" | "complete">("select");
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null,
  );
  const [votePin, setVotePin] = useState(""); // US2.3: Encryption Key
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState({ txId: "", timestamp: "" });

  // Security Check: Redirect if no JWT session exists
  useEffect(() => {
    const token = localStorage.getItem("voterToken");
    if (!token && step !== "complete") {
      navigate("/");
    }
  }, [navigate, step]);

  const handleSubmitVote = async () => {
    // 1. Basic Validation
    if (!selectedCandidate || votePin.length < 4) {
      toast({
        variant: "destructive",
        title: "Action Required",
        description:
          "Please select a candidate and enter your 4-6 digit secure PIN.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Retrieve the JWT generated during the OTP phase
      const token = localStorage.getItem("voterToken");

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      // 3. Submit the vote
      // Note: We pass selectedCandidate (ballot), votePin (encryption key), and the token (auth)
      const candidateName =
        candidates.find((c) => c.id === selectedCandidate)?.name || "";
      const result = await castSecureVote(candidateName, votePin, token);

      if (result.success) {
        // 4. US2.1 & US2.6: Clear identity traces immediately after success
        sessionStorage.clear();
        localStorage.removeItem("voterToken");

        // 5. US2.5: Set the receipt data for the voter to save
        setReceiptData({
          txId: result.receipt, // This is the SHA-256 hash from Node.js
          timestamp: new Date().toLocaleString(),
        });

        // 6. Transition to the success screen
        setStep("complete");

        toast({
          title: "Vote Cast Successfully",
          description: "Your encrypted ballot has been recorded and hashed.",
        });
      } else {
        throw new Error(
          result.message || "The voting server rejected the ballot.",
        );
      }
    } catch (error: any) {
      console.error("Voting Error:", error);

      toast({
        variant: "destructive",
        title: "Voting Failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "Could not connect to the voting service.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "complete") {
    return (
      <PageWrapper>
        <Layout>
          <div className="min-h-screen bg-neutral-100 flex items-center justify-center py-12 px-4">
            <div className="bg-white max-w-lg w-full p-10 rounded-sm shadow-md border-t-4 border-green-600 text-center relative overflow-hidden">
              <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 border-4 border-green-100">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Vote Cast Successfully
              </h1>
              <p className="text-neutral-500 mb-8 font-medium">
                Official Anonymous Ballot Receipt
              </p>

              <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-sm mb-8 text-left">
                <div className="mb-4 border-b border-neutral-200 pb-2">
                  <span className="text-xs font-bold uppercase text-neutral-500 block mb-1">
                    Receipt ID (SHA-256)
                  </span>
                  <span className="font-mono text-[10px] break-all font-bold text-neutral-900">
                    {receiptData.txId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-neutral-500">
                    Timestamp
                  </span>
                  <span className="font-mono text-sm font-bold text-neutral-900">
                    {receiptData.timestamp}
                  </span>
                </div>
              </div>

              <Button
                className="w-full bg-primary-900 text-white py-6 uppercase font-bold"
                onClick={() => navigate("/")}
              >
                Logout & Exit
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
        <div className="min-h-screen bg-neutral-100 py-12 px-4">
          <div className="container max-w-3xl">
            <div className="bg-white rounded-sm shadow-md border border-neutral-200 overflow-hidden">
              <div className="bg-primary-900 px-6 py-4 border-b border-primary-800">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  {step === "select" ? (
                    <>
                      <Vote className="h-5 w-5 text-accent-400" /> Select
                      Candidate
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-5 w-5 text-accent-400" /> Review &
                      Sign
                    </>
                  )}
                </h2>
              </div>

              <div className="p-6 md:p-8">
                {step === "select" ? (
                  <div className="space-y-4">
                    {candidates.map((candidate) => (
                      <button
                        key={candidate.id}
                        onClick={() => setSelectedCandidate(candidate.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-sm border-2 transition-all text-left ${
                          selectedCandidate === candidate.id
                            ? "border-primary-700 bg-primary-50/50"
                            : "border-neutral-200"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${candidate.color}`}
                        >
                          {candidate.image}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-lg">{candidate.name}</p>
                          <p className="text-sm text-neutral-500">
                            {candidate.party}
                          </p>
                        </div>
                      </button>
                    ))}
                    <Button
                      onClick={() => setStep("confirm")}
                      disabled={!selectedCandidate}
                      className="w-full mt-6 bg-primary-900 text-white py-6"
                    >
                      Review Selection <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-neutral-50 border-2 border-dashed p-6 text-center">
                      <h3 className="text-2xl font-bold">
                        {
                          candidates.find((c) => c.id === selectedCandidate)
                            ?.name
                        }
                      </h3>
                      <p className="text-neutral-600">
                        {
                          candidates.find((c) => c.id === selectedCandidate)
                            ?.party
                        }
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                        <KeyRound size={16} /> Enter Voting PIN to Encrypt
                        Ballot
                      </label>
                      <input
                        type="password"
                        value={votePin}
                        onChange={(e) => setVotePin(e.target.value)}
                        placeholder="Enter your 4-6 digit PIN"
                        className="w-full p-4 border rounded-sm text-center text-xl tracking-widest"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setStep("select")}
                        className="flex-1 py-6"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmitVote}
                        disabled={isSubmitting || votePin.length < 4}
                        className="flex-1 bg-green-700 text-white py-6"
                      >
                        {isSubmitting ? "Encrypting..." : "Cast Encrypted Vote"}
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
