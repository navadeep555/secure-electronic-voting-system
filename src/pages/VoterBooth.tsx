import React, { useState, useEffect } from "react";
import { ShieldCheck, Fingerprint, Send } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function VoterBooth({ electionId }: { electionId: string }) {
  const [step, setStep] = useState<"verify" | "vote" | "receipt">("verify");
  const [candidates, setCandidates] = useState([]);
  const [receipt, setReceipt] = useState<any>(null);

  // 1. Simulate Biometric Verification
  const handleVerify = () => {
    toast.promise(new Promise((res) => setTimeout(res, 2000)), {
      loading: "Scanning Biometrics...",
      success: () => {
        setStep("vote");
        return "Identity Verified";
      },
    });
  };

  // 2. Cast Ballot
  const castVote = async (candidateId: string) => {
    try {
      const res = await axios.post(`/api/voter/vote`, {
        election_id: electionId,
        candidate_id: candidateId,
        voter_id: "VOTER_SIM_123", // In production, this comes from the auth token
      });

      setReceipt(res.data);
      setStep("receipt");
      toast.success("Vote Recorded in Ledger");
    } catch (err) {
      toast.error("Double voting detected or system error.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl border border-neutral-100">
      {step === "verify" && (
        <div className="text-center space-y-6 py-10">
          <Fingerprint
            size={64}
            className="mx-auto text-[#800020] animate-pulse"
          />
          <h2 className="text-2xl font-bold">Identity Verification</h2>
          <p className="text-neutral-500">
            Position your face in the camera frame to unlock your digital
            ballot.
          </p>
          <button
            onClick={handleVerify}
            className="bg-[#800020] text-white px-8 py-3 rounded-full font-bold"
          >
            Start Verification
          </button>
        </div>
      )}

      {step === "vote" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Official Ballot</h2>
          <div className="grid gap-4">
            {/* Map through candidates fetched from your API */}
            {["Alice Smith", "Bob Jones"].map((name, i) => (
              <button
                key={i}
                onClick={() => castVote(String(i))}
                className="flex items-center justify-between p-4 border rounded-xl hover:bg-neutral-50 transition-colors"
              >
                <span className="font-bold">{name}</span>
                <Send size={18} className="text-neutral-300" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "receipt" && (
        <div className="space-y-6 text-center py-6">
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-2xl font-bold">Vote Secured</h2>
          <div className="bg-neutral-50 p-4 rounded-lg font-mono text-xs text-left break-all border border-neutral-200">
            <p className="font-bold mb-2 border-b pb-1 text-neutral-400 uppercase">
              Cryptographic Receipt
            </p>
            <p>Receipt ID: {receipt?.vote_id}</p>
            <p className="mt-2">
              Integrity Seal: <br />
              {receipt?.integrity_signature}
            </p>
          </div>
          <p className="text-sm text-neutral-400 italic">
            This receipt proves your vote is in the chain without revealing your
            choice.
          </p>
        </div>
      )}
    </div>
  );
}
