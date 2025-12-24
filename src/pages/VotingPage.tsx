import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { SecurityBadge } from "@/components/ui/SecurityBadge";
import { Shield, CheckCircle, ArrowRight, ArrowLeft, Vote, Lock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const candidates = [
  { id: "1", name: "Sarah Mitchell", party: "Progressive Alliance", image: "SM" },
  { id: "2", name: "James Anderson", party: "Conservative Union", image: "JA" },
  { id: "3", name: "Maria Santos", party: "Democratic Center", image: "MS" },
  { id: "4", name: "Robert Chen", party: "Green Future", image: "RC" },
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
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setStep("complete");
    toast({ title: "Vote Cast Successfully", description: "Your anonymous vote has been recorded." });
  };

  if (step === "complete") {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center py-12">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-4">Vote Recorded</h1>
            <p className="text-muted-foreground mb-6">Your anonymous ballot has been securely recorded. Receipt: #VR-2024-{Math.random().toString(36).substring(7).toUpperCase()}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="accent" onClick={() => navigate("/dashboard/voter")}>Return to Dashboard</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-display font-bold text-foreground">2024 Presidential Election</h1>
            <SecurityBadge type="anonymous" />
          </div>

          <div className="bg-card rounded-2xl shadow-card p-6">
            {step === "select" && (
              <>
                <h2 className="text-lg font-semibold text-foreground mb-4">Select Your Candidate</h2>
                <div className="space-y-3">
                  {candidates.map((candidate) => (
                    <button
                      key={candidate.id}
                      onClick={() => setSelectedCandidate(candidate.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        selectedCandidate === candidate.id
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">{candidate.image}</div>
                      <div className="text-left flex-1">
                        <p className="font-medium text-foreground">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground">{candidate.party}</p>
                      </div>
                      {selectedCandidate === candidate.id && <CheckCircle className="h-6 w-6 text-accent" />}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <Button variant="accent" onClick={() => setStep("confirm")} disabled={!selectedCandidate}>
                    Review Selection <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}

            {step === "confirm" && (
              <>
                <div className="text-center mb-6">
                  <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">Confirm Your Vote</h2>
                  <p className="text-muted-foreground">This action cannot be undone.</p>
                </div>
                <div className="p-4 bg-secondary rounded-xl mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Your Selection:</p>
                  <p className="text-lg font-semibold text-foreground">
                    {candidates.find((c) => c.id === selectedCandidate)?.name}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("select")}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
                  </Button>
                  <Button variant="success" className="flex-1" onClick={handleSubmitVote} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : <><Lock className="h-4 w-4 mr-2" /> Cast Vote</>}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
