import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Layout } from "@/components/layout/Layout";
import { PageWrapper } from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Election {
  election_id: string;
  title: string;
  start_time: number;
  end_time: number;
  status: string;
}

const API_BASE = "http://localhost:5001/api/voter";

export default function VoterDashboard() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  /* =========================
     FETCH ACTIVE ELECTIONS
     ========================= */
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
          setError("Unable to load elections");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  /* =========================
     UI STATES
     ========================= */
  if (loading) {
    return (
      <PageWrapper>
        <Layout>
          <div className="h-screen flex items-center justify-center text-lg">
            Loading elections...
          </div>
        </Layout>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <Layout>
          <div className="h-screen flex items-center justify-center text-red-600">
            {error}
          </div>
        </Layout>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Layout>
        <div className="min-h-screen bg-neutral-100 p-6">
          <h1 className="text-2xl font-bold mb-6">🗳️ Active Elections</h1>

          {elections.length === 0 ? (
            <p className="text-neutral-500">
              No active elections available at the moment.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {elections.map((election) => (
                <motion.div
                  key={election.election_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow p-6 border-t-4 border-primary-700"
                >
                  <h2 className="text-lg font-semibold mb-2">
                    {election.title}
                  </h2>

                  <p className="text-sm text-neutral-500 mb-4">
                    Ends on{" "}
                    {new Date(election.end_time * 1000).toLocaleString()}
                  </p>

                  <Button
                    className="w-full"
                    onClick={() =>
                      navigate(
                        `/dashboard/voter/election/${election.election_id}`,
                      )
                    }
                  >
                    Vote Now
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </PageWrapper>
  );
}
