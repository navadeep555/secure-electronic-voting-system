import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Layout } from "@/components/layout/Layout";
import { PageWrapper } from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Candidate {
  candidate_id: string;
  name: string;
  party: string;
}

const API_BASE = "http://localhost:5001/api/voter";

export default function VoteElection() {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  // ✅ FIX: Track the candidate_id, not the name
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* =========================
      LOAD CANDIDATES
     ========================= */
  useEffect(() => {
    const token = localStorage.getItem("voterToken");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`${API_BASE}/elections/${electionId}/candidates`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCandidates(res.data))
      .catch(() => {
        toast({
          title: "Error",
          description: "Unable to load candidates",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [electionId, navigate, toast]);

  /* =========================
      CAST VOTE
     ========================= */
  const submitVote = async () => {
    // Check validation
    if (!selectedCandidateId || pin.length < 4) {
      toast({
        title: "Incomplete",
        description: "Select a candidate and enter your PIN",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // ✅ FIX: Match the exact keys the Python backend expects
      await axios.post(
        "http://localhost:5001/api/voter/cast-vote",
        {
          election_id: electionId, // Backend expects election_id
          candidate_id: selectedCandidateId, // Backend expects candidate_id
          pin: pin,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("voterToken")}`,
          },
        },
      );

      toast({
        title: "Vote Cast Successfully 🗳️",
        description: "Your vote has been securely recorded.",
      });

      navigate("/dashboard/voter");
    } catch (err: any) {
      toast({
        title: "Voting Failed",
        // This will now show the actual error message from your Flask 'received' debug block
        description: err.response?.data?.message || "Vote submission failed",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Layout>
          <div className="h-screen flex items-center justify-center font-medium">
            Loading secure ballot...
          </div>
        </Layout>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Layout>
        <div className="min-h-screen bg-neutral-100 p-6">
          <h1 className="text-2xl font-bold mb-6 text-center text-neutral-800">
            🗳️ Cast Your Vote
          </h1>

          <Card className="max-w-xl mx-auto p-6 space-y-6 shadow-lg border-t-4 border-primary-600">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                Select Candidate
              </p>
              {candidates.length === 0 ? (
                <p className="text-neutral-500 italic">
                  No candidates available for this election.
                </p>
              ) : (
                candidates.map((c) => (
                  <label
                    key={c.candidate_id}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedCandidateId === c.candidate_id
                        ? "border-primary-600 bg-primary-50 shadow-sm"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="candidate"
                      value={c.candidate_id}
                      checked={selectedCandidateId === c.candidate_id}
                      onChange={() => setSelectedCandidateId(c.candidate_id)}
                      className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-neutral-900 text-lg">
                        {c.name}
                      </span>
                      <span className="text-sm text-primary-700 font-medium">
                        {c.party}
                      </span>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                Security PIN
              </label>
              <input
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="w-full border-2 rounded-xl px-4 py-3 text-center text-2xl tracking-[1em] focus:border-primary-600 focus:outline-none transition-colors"
                maxLength={6}
              />
              <p className="text-[10px] text-neutral-400 text-center italic">
                Enter the secure PIN you created during registration
              </p>
            </div>

            <Button
              className="w-full h-14 text-lg font-bold rounded-xl shadow-md transition-transform active:scale-95"
              onClick={submitVote}
              disabled={submitting || !selectedCandidateId || pin.length < 4}
            >
              {submitting ? "Submitting Securely..." : "Confirm & Cast Vote"}
            </Button>
          </Card>
        </div>
      </Layout>
    </PageWrapper>
  );
}
