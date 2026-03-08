import { useState, useEffect } from "react";
import axios from "axios";
import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import {
  Eye,
  Users,
  Vote,
  Clock,
  TrendingUp,
  RefreshCw,
  Download,
  BarChart3,
  MapPin,
  Shield,
  FileText,
  Lock,
} from "lucide-react";

export default function ObserverDashboard() {
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [auditData, setAuditData] = useState<any>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch all elections on mount
  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const res = await axios.get("/api/admin/elections");
      setElections(res.data);
      if (res.data.length > 0 && !selectedElection) {
        setSelectedElection(res.data[0]);
        fetchAudit(res.data[0].election_id);
      }
    } catch (err) {
      console.error("Failed to fetch elections", err);
    }
  };

  const fetchAudit = async (eid: string) => {
    setIsRefreshing(true);
    try {
      const res = await axios.get(
        `/api/observer/results/${eid}`,
      );
      setAuditData(res.data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Audit failed", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (selectedElection) fetchAudit(selectedElection.election_id);
    fetchElections();
  };

  const isMasked = auditData?.status === "VOTING_IN_PROGRESS";

  return (
    <PageWrapper>
      <Layout>
        <div className="min-h-screen bg-neutral-100">
          {/* Header */}
          <div className="bg-primary-900 border-b border-primary-800 text-white py-8 shadow-sm">
            <div className="container max-w-7xl px-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary-800 text-primary-200 text-xs font-bold px-2 py-0.5 rounded-sm uppercase flex items-center gap-1 border border-primary-700">
                      <Eye className="h-3 w-3" /> Public Observer Portal
                    </span>
                  </div>
                  <h1 className="text-3xl font-display font-bold">
                    Election Monitoring
                  </h1>
                  <p className="text-primary-200 text-sm mt-1 max-w-2xl">
                    Real-time transparency dashboard providing independent
                    verification of electoral data.
                  </p>
                </div>
                <div className="flex items-center gap-4 bg-primary-800/50 p-4 rounded-sm border border-primary-700">
                  <div className="text-right">
                    <p className="text-xs text-primary-300 uppercase font-bold">
                      Audit Timestamp
                    </p>
                    <p className="font-mono font-bold text-white">
                      {lastRefresh.toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="bg-primary-700 hover:bg-primary-600 text-white border border-primary-600"
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="container max-w-7xl py-8 px-6">
            {/* Election Selector */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-neutral-200">
              {elections.map((election) => (
                <button
                  key={election.election_id}
                  onClick={() => {
                    setSelectedElection(election);
                    fetchAudit(election.election_id);
                  }}
                  className={`px-6 py-3 rounded-t-sm text-sm font-bold uppercase tracking-wide transition-colors border-b-2 whitespace-nowrap ${selectedElection?.election_id === election.election_id
                      ? "bg-white text-primary-900 border-primary-800"
                      : "bg-transparent text-neutral-500 hover:text-neutral-900 border-transparent hover:border-neutral-300"
                    }`}
                >
                  {election.title}
                </button>
              ))}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Eligible Voters"
                value={auditData?.total_registered || "0"}
                icon={<Users className="h-5 w-5 text-neutral-600" />}
                className="border-t-4 border-t-neutral-600"
              />
              <StatCard
                title="Votes Cast"
                value={auditData?.total_cast || "0"}
                icon={<Vote className="h-5 w-5 text-primary-700" />}
                className="border-t-4 border-t-primary-700"
              />
              <StatCard
                title="Turnout Rate"
                value={`${auditData?.turnout_percentage || 0}%`}
                icon={<TrendingUp className="h-5 w-5 text-green-600" />}
                className="border-t-4 border-t-green-600"
              />
              <StatCard
                title="Ledger Status"
                value={auditData?.audit_report?.system_status || "OFFLINE"}
                description={`Verified ${auditData?.audit_report?.integrity_verified || 0} blocks`}
                icon={
                  <Shield
                    className={`h-5 w-5 ${auditData?.audit_report?.system_status === "SECURE" ? "text-emerald-600" : "text-rose-600"}`}
                  />
                }
                className={`border-t-4 ${auditData?.audit_report?.system_status === "SECURE" ? "border-t-emerald-600" : "border-t-rose-600"}`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Results / Privacy Mask Section */}
              <div className="bg-white rounded-sm p-6 shadow-sm border border-neutral-200 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6 border-b border-neutral-100 pb-4">
                  <h2 className="font-bold text-neutral-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary-700" />
                    Live Results Distribution
                  </h2>
                </div>

                {isMasked ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                    <div className="bg-neutral-100 p-4 rounded-full">
                      <Lock className="h-8 w-8 text-neutral-400" />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-800">
                        Results Masked
                      </p>
                      <p className="text-xs text-neutral-500 max-w-[250px]">
                        To protect voter anonymity, candidate-wise results are
                        hidden until the election is closed or 3+ votes are
                        cast.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {auditData?.results &&
                      Object.entries(auditData.results).map(
                        ([name, count]: any) => (
                          <div key={name}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-bold text-neutral-700">
                                {name}
                              </span>
                              <span className="text-sm font-mono font-bold text-neutral-900">
                                {count} votes
                              </span>
                            </div>
                            <div className="h-3 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                              <div
                                className="h-full bg-primary-700 transition-all duration-1000"
                                style={{
                                  width: `${(count / auditData.total_cast) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        ),
                      )}
                  </div>
                )}
              </div>

              {/* System Status Indicators */}
              <div className="bg-white rounded-sm p-6 shadow-sm border border-neutral-200">
                <h2 className="font-bold text-neutral-900 mb-6 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary-700" /> System
                  Integrity Check
                </h2>
                <div className="space-y-4">
                  <div
                    className={`flex items-center justify-between p-4 rounded-sm border ${auditData?.audit_report?.system_status === "SECURE"
                        ? "bg-green-50 border-green-200"
                        : "bg-amber-50 border-amber-200"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={`w-3 h-3 rounded-full ${auditData?.audit_report?.system_status === "SECURE" ? "bg-green-600" : "bg-amber-600"}`}
                        />
                        <div
                          className={`absolute top-0 left-0 w-3 h-3 rounded-full animate-ping opacity-50 ${auditData?.audit_report?.system_status === "SECURE" ? "bg-green-600" : "bg-amber-600"}`}
                        />
                      </div>
                      <span
                        className={`font-bold ${auditData?.audit_report?.system_status === "SECURE" ? "text-green-900" : "text-amber-900"}`}
                      >
                        {auditData?.audit_report?.system_status === "SECURE"
                          ? "Ledger Verified"
                          : "System Initializing"}
                      </span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {auditData?.status || "PENDING"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {[
                      {
                        label: "Voters Registered",
                        value: auditData?.total_registered || "0",
                      },
                      {
                        label: "Chain Head",
                        value:
                          auditData?.audit_report?.latest_hash?.substring(
                            0,
                            12,
                          ) + "..." || "None",
                      },
                      {
                        label: "Integrity Verified",
                        value: `${auditData?.audit_report?.integrity_verified || 0} Votes`,
                      },
                      { label: "Anonymity Protocol", value: "AES-256 + HMAC" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-3 bg-neutral-50 rounded-sm border border-neutral-200"
                      >
                        <p className="text-xs font-bold text-neutral-500 uppercase mb-1">
                          {item.label}
                        </p>
                        <p className="font-bold text-neutral-900 truncate">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Download Reports */}
              <div className="bg-white rounded-sm p-6 shadow-sm border border-neutral-200">
                <h2 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-700" /> Public Audit
                  Logs
                </h2>
                <p className="text-sm text-neutral-500 mb-6">
                  Verify the cryptographic chain of custody for all ballots in
                  this election.
                </p>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-neutral-50 hover:bg-white border-neutral-300 text-neutral-700 font-medium"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Proof of Integrity (SHA-256)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-neutral-50 hover:bg-white border-neutral-300 text-neutral-700 font-medium"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Aggregated Regional Stats (CSV)
                  </Button>
                </div>
              </div>
            </div>

            {/* Transparency Notice */}
            <div className="mt-8 p-6 bg-primary-50 rounded-sm border border-primary-100 flex items-start gap-4">
              <div className="p-2 bg-white rounded-full border border-primary-100 shrink-0">
                <Shield className="h-6 w-6 text-primary-800" />
              </div>
              <div>
                <h3 className="font-bold text-primary-900 mb-2">
                  Transparency Commitment
                </h3>
                <p className="text-sm text-primary-800/80 leading-relaxed">
                  This portal monitors the{" "}
                  <strong>{selectedElection?.title}</strong>. Every 10 seconds,
                  our system performs a full cryptographic sweep of the vote
                  ledger to ensure no entries have been tampered with.
                  Currently, {auditData?.audit_report?.integrity_verified || 0}{" "}
                  votes have been verified against the master HMAC key.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </PageWrapper>
  );
}
