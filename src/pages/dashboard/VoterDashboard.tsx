
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Layout } from "@/components/layout/Layout";
import { PageWrapper } from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Clock, CheckCircle, Shield } from "lucide-react"; // Added for better UX

interface Election {
  election_id: string;
  title: string;
  start_time: number;
  end_time: number;
  status: string;
}

const API_BASE = "/api/voter";

export default function VoterDashboard() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("voterToken");

    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`${API_BASE}/elections`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setElections(res.data);
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        } else {
          setError("Unable to load secure election list");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <PageWrapper>
        <Layout>
          <div className="h-screen flex flex-col items-center justify-center gap-4 text-neutral-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800020]"></div>
            <p>Authenticating Ledger Access...</p>
          </div>
        </Layout>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Layout>
        <div className="min-h-screen bg-[#F8F9FA] p-8">
          <header className="mb-10 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Available Ballots
              </h1>
              <p className="text-neutral-500 flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#800020]" />
                Identity Verified: Cryptographic Session Active
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-neutral-400 uppercase">
                Voter Portal
              </p>
              <p className="text-sm font-semibold text-neutral-900">
                Registered Citizen
              </p>
            </div>
          </header>

          {error ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700">
              {error}
            </div>
          ) : elections.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-neutral-200">
              <CheckCircle className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500 font-medium">
                No active elections found on the secure ledger.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {elections.map((election, index) => (
                <motion.div
                  key={election.election_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-2 bg-[#800020]" /> {/* Theme Accent */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        Live
                      </span>
                      <Clock className="h-4 w-4 text-neutral-400" />
                    </div>

                    <h2 className="text-xl font-bold text-neutral-900 mb-2">
                      {election.title}
                    </h2>

                    <p className="text-sm text-neutral-500 mb-6">
                      Polls close:{" "}
                      {new Date(election.end_time * 1000).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    <Button
                      className="w-full bg-[#800020] hover:bg-[#600018] text-white py-6 rounded-xl font-bold shadow-lg shadow-red-900/10"
                      onClick={() =>
                        // FIX: Updated to match App.tsx route
                        navigate(`/vote/${election.election_id}`)
                      }
                    >
                      Cast Secure Vote
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </PageWrapper>
  );
}
