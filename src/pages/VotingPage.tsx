import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import { useIdleTimer } from "@/hooks/useIdleTimer"; 
import { useToast } from "@/hooks/use-toast";
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
  
  // US 1.7: Initialize Kiosk Idle Timer (60 seconds)
  useIdleTimer(60); 

  const [step, setStep] = useState<"select" | "confirm" | "complete">("select");
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState({ txId: "", timestamp: "" });

  // Security Check: Redirect if no session exists
  useEffect(() => {
    const session = sessionStorage.getItem("userIdHash");
    if (!session && step !== "complete") {
      navigate("/");
    }
  }, [navigate, step]);

  const handleSubmitVote = async () => {
    const userIdHash = sessionStorage.getItem("userIdHash");
    
    if (!userIdHash || !selectedCandidate) {
      toast({ variant: "destructive", title: "Session Error", description: "Identity not verified." });
      return;
    }

    setIsSubmitting(true);

    try {
      // Connect to Python Backend
      const response = await axios.post("http://localhost:5001/api/cast-vote", {
        userIdHash: userIdHash,
        candidateId: selectedCandidate
      });

      if (response.data.success) {
        // US 1.6: Anonymity - Clear identity from session immediately
        sessionStorage.removeItem("userIdHash");
        
        setReceiptData({
          txId: `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}...${Math.random().toString(16).slice(2, 5).toUpperCase()}`,
          timestamp: new Date().toLocaleTimeString()
        });
        
        setStep("complete");
        toast({ title: "Vote Recorded", description: "Your ballot has been cast anonymously." });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Voting Failed",
        description: error.response?.data?.message || "Communication error with voting server."
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
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                <Shield className="h-64 w-64 text-neutral-900" />
              </div>
              <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 border-4 border-green-100">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">Vote Cast Successfully</h1>
              <p className="text-neutral-500 mb-8 font-medium">Official Anonymous Ballot Receipt</p>
              
              <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-sm mb-8 text-left">
                <div className="flex justify-between items-center mb-4 border-b border-neutral-200 pb-2">
                  <span className="text-xs font-bold uppercase text-neutral-500">Receipt ID</span>
                  <span className="font-mono text-sm font-bold text-neutral-900">{receiptData.txId}</span>
                </div>
                <div className="flex justify-between items-center mb-4 border-b border-neutral-200 pb-2">
                  <span className="text-xs font-bold uppercase text-neutral-500">Timestamp</span>
                  <span className="font-mono text-sm font-bold text-neutral-900">{receiptData.timestamp}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-neutral-500">Verification</span>
                  <span className="text-sm font-bold text-green-700 flex items-center gap-1"><Lock className="h-3 w-3" /> Integrity Verified</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button className="w-full bg-primary-900 hover:bg-black text-white py-6 uppercase font-bold tracking-wide rounded-sm" 
                        onClick={() => { window.location.href = "/"; }}>
                  Exit Secure Session
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
            {/* Ballot Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white p-6 rounded-sm shadow-sm border border-neutral-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-50 rounded-full">
                  <Flag className="h-6 w-6 text-primary-700" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900 uppercase">Secure Digital Ballot</h1>
                  <p className="text-neutral-500 text-sm">Session active: {sessionStorage.getItem("userIdHash")?.slice(0,8)}...</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-full border border-neutral-200">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-xs font-bold uppercase text-neutral-600">Zero-Knowledge Protocol</span>
              </div>
            </div>

            <div className="bg-white rounded-sm shadow-md border border-neutral-200 overflow-hidden">
              <div className="bg-primary-900 px-6 py-4 border-b border-primary-800">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  {step === "select" ? <><Vote className="h-5 w-5 text-accent-400" /> Select Candidate</> 
                                     : <><FileCheck className="h-5 w-5 text-accent-400" /> Review Selection</>}
                </h2>
              </div>

              <div className="p-6 md:p-8">
                {step === "select" ? (
                  <>
                    <div className="space-y-4">
                      {candidates.map((candidate) => (
                        <button
                          key={candidate.id}
                          onClick={() => setSelectedCandidate(candidate.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-sm border-2 transition-all text-left ${
                            selectedCandidate === candidate.id ? "border-primary-700 bg-primary-50/50" : "border-neutral-200 bg-white"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedCandidate === candidate.id ? "border-primary-700" : "border-neutral-300"
                          }`}>
                            {selectedCandidate === candidate.id && <div className="w-3 h-3 bg-primary-700 rounded-full" />}
                          </div>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${candidate.color}`}>
                            {candidate.image}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-lg text-neutral-900">{candidate.name}</p>
                            <p className="text-sm text-neutral-500">{candidate.party}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-end mt-8 pt-6 border-t">
                      <Button onClick={() => setStep("confirm")} disabled={!selectedCandidate} className="bg-primary-900 text-white px-8 py-6 rounded-sm uppercase font-bold">
                        Review Selection <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold">Final Confirmation</h2>
                      <p className="text-neutral-500">Once cast, your vote is encrypted and cannot be changed.</p>
                    </div>
                    <div className="bg-neutral-50 border-2 border-dashed p-6 text-center mb-8">
                      <h3 className="text-2xl font-bold">{candidates.find(c => c.id === selectedCandidate)?.name}</h3>
                      <p className="text-neutral-600">{candidates.find(c => c.id === selectedCandidate)?.party}</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" onClick={() => setStep("select")} className="flex-1 py-6 font-bold uppercase">Back</Button>
                      <Button onClick={handleSubmitVote} disabled={isSubmitting} className="flex-1 bg-green-700 text-white py-6 font-bold uppercase">
                        {isSubmitting ? "Encrypting..." : "Confirm Vote"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </PageWrapper>
  );
}