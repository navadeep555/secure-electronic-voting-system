import { useState } from "react";
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
  Flag
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
  const [step, setStep] = useState<"select" | "confirm" | "complete">("select");
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitVote = async () => {
    setIsSubmitting(true);
    // Simulate cryptographic delay
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setIsSubmitting(false);
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
          <div className="min-h-screen bg-neutral-100 flex items-center justify-center py-12 px-4">
            <div className="bg-white max-w-lg w-full p-10 rounded-sm shadow-md border-t-4 border-green-600 text-center relative overflow-hidden">
              {/* Background Watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                <Shield className="h-64 w-64 text-neutral-900" />
              </div>

              <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 border-4 border-green-100">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>

              <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">Vote Cast Successfully</h1>
              <p className="text-neutral-500 mb-8 font-medium">
                Official Ballot Receipt
              </p>

              <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-sm mb-8 text-left">
                <div className="flex justify-between items-center mb-4 border-b border-neutral-200 pb-2">
                  <span className="text-xs font-bold uppercase text-neutral-500">Transaction ID</span>
                  <span className="font-mono text-sm font-bold text-neutral-900">0x8F3...2A9</span>
                </div>
                <div className="flex justify-between items-center mb-4 border-b border-neutral-200 pb-2">
                  <span className="text-xs font-bold uppercase text-neutral-500">Time Stamp</span>
                  <span className="font-mono text-sm font-bold text-neutral-900">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-neutral-500">Status</span>
                  <span className="text-sm font-bold text-green-700 flex items-center gap-1"><Lock className="h-3 w-3" /> Encrypted & Stored</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button className="w-full bg-primary-900 hover:bg-black text-white py-6 uppercase font-bold tracking-wide rounded-sm" onClick={() => navigate("/dashboard/voter")}>
                  Return to Dashboard
                </Button>
                <Button variant="ghost" className="text-neutral-500 hover:text-neutral-900 text-sm">
                  Download Receipt (PDF)
                </Button>
              </div>
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
                          {/* Radio Indicator */}
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
                      <Button className="flex-1 max-w-[200px] bg-green-700 hover:bg-green-800 text-white uppercase font-bold tracking-wide py-6 rounded-sm shadow-md" onClick={handleSubmitVote} disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : <><Lock className="h-4 w-4 mr-2" /> Confirm Vote</>}
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
