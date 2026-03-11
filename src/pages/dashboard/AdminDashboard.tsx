import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/StatCard";
import { PageWrapper } from "@/components/PageWrapper";
import { toast } from "sonner";
import axios from "axios";
import {
  Users,
  Vote,
  BarChart3,
  UserCheck,
  Shield,
  FileText,
  Clock,
  LogOut,
  Trophy,
  Activity,
  ShieldCheck,
  Globe,
  Loader2,
} from "lucide-react";
import { AdminElectionsView } from "@/components/admin/AdminElectionsView";
import { AdminVotersView } from "@/components/admin/AdminVotersView";
import { electionService } from "@/services/electionService";

interface Election {
  election_id: string;
  title: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED";
  start_time: number;
  end_time: number;
  candidate_count: number;
  results_published: number;
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<
    "overview" | "verifications" | "elections" | "voters"
  >("overview");
  const [dbElections, setDbElections] = useState<Election[]>([]);
  const [stats, setStats] = useState({ totalVoters: 0, verifiedBlocks: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    if (activeSection === "overview") {
      fetchOverviewData();
    }
  }, [activeSection, navigate]);

  const fetchOverviewData = async () => {
    const token = localStorage.getItem("token");
    try {
      setIsLoading(true);
      const res = await electionService.getElections();
      setDbElections(res.data);

      const statsRes = await axios.get(
        "/api/admin/stats",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setStats(statsRes.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Session expired.");
        handleLogout();
      } else {
        toast.error("Failed to sync with secure ledger");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW: Handle PDF Generation (US 5.1) ---
  const handleDownloadPDF = async (electionId: string, title: string) => {
    try {
      setDownloadingId(electionId);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `/api/admin/election/${electionId}/report/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", // Handle binary data
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Audit_Certificate_${title.replace(/\s+/g, "_")}.pdf`,
      );
      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Audit certificate downloaded.");
    } catch (error) {
      toast.error("Failed to generate PDF. Is the election closed?");
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePublishResults = async (electionId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/admin/elections/${electionId}/toggle-publish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Results officially published!");
      fetchOverviewData();
    } catch (error) {
      toast.error("Failed to publish results.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const sidebarItems = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "verifications", label: "Verifications", icon: UserCheck },
    { key: "elections", label: "Elections", icon: Vote },
    { key: "voters", label: "Voters", icon: Users },
  ];

  return (
    <PageWrapper>
      <Layout>
        <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
          {/* SIDEBAR */}
          <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col shadow-sm">
            <div className="p-6 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <Shield className="h-7 w-7 text-[#800020]" />
                <div className="leading-tight">
                  <p className="font-bold text-sm uppercase tracking-widest">
                    Admin Portal
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    SecureVote Admin
                  </p>
                </div>
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${activeSection === item.key
                    ? "bg-red-50 text-[#800020] border-l-4 border-[#800020]"
                    : "text-neutral-500 hover:bg-neutral-50 border-l-4 border-transparent"
                    }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="p-4 mt-auto border-t border-neutral-100">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-8">
              <h1 className="text-xl font-bold text-neutral-800 capitalize">
                {activeSection}
              </h1>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold">Administrator</p>
                  <p className="text-[10px] text-neutral-400 uppercase">
                    Super Admin
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#400010] flex items-center justify-center text-white font-bold">
                  AD
                </div>
              </div>
            </header>

            <main className="flex-1 p-8 overflow-y-auto">
              {activeSection === "overview" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      title="Total Voters"
                      value={isLoading ? "..." : stats.totalVoters.toString()}
                      icon={<Users className="text-blue-600" />}
                    />
                    <StatCard
                      title="Active Elections"
                      value={dbElections
                        .filter((e) => e.status === "ACTIVE")
                        .length.toString()}
                      icon={<Vote className="text-green-600" />}
                    />
                    <StatCard
                      title="Ledger Health"
                      value="Secure"
                      icon={<ShieldCheck className="text-[#800020]" />}
                      description="HMAC Chains Verified"
                    />
                    <StatCard
                      title="System Status"
                      value="Optimal"
                      icon={<Activity className="text-amber-500" />}
                    />
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                      <h2 className="font-bold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#800020]" /> Secure
                        Ledger Records
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchOverviewData}
                        disabled={isLoading}
                      >
                        <Clock
                          className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                        />{" "}
                        Sync
                      </Button>
                    </div>

                    <div className="p-6 space-y-4">
                      {dbElections.map((e) => {
                        const now = Math.floor(Date.now() / 1000);
                        const isCompleted =
                          (now > e.end_time && e.status !== "DRAFT") || e.status === "CLOSED";

                        let displayStatus = e.status;
                        let statusColor = "bg-neutral-100 text-neutral-800";

                        if (isCompleted) {
                          displayStatus = "CLOSED";
                          statusColor = "bg-neutral-200 text-neutral-800";
                        } else if (e.status === "ACTIVE") {
                          statusColor = "bg-green-100 text-green-700";
                        } else if (e.status === "PAUSED") {
                          statusColor = "bg-orange-100 text-orange-800";
                        } else if (e.status === "DRAFT") {
                          statusColor = "bg-blue-100 text-blue-800";
                        }

                        return (
                          <div
                            key={e.election_id}
                            className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-100"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-white border rounded flex flex-col items-center justify-center shadow-sm">
                                <span className="text-lg font-bold">
                                  {new Date(e.start_time * 1000).getDate()}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold">{e.title}</h3>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${statusColor}`}
                                  >
                                    {displayStatus}
                                  </span>
                                  {e.results_published === 1 && (
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                                      <Globe className="h-3 w-3" /> Public
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* PDF DOWNLOAD BUTTON */}
                              {isCompleted && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-700 border-blue-200 hover:bg-blue-50"
                                  onClick={() =>
                                    handleDownloadPDF(e.election_id, e.title)
                                  }
                                  disabled={downloadingId === e.election_id}
                                >
                                  {downloadingId === e.election_id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <FileText className="h-4 w-4 mr-2" />
                                  )}
                                  PDF
                                </Button>
                              )}

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(`/admin/audit/${e.election_id}`)
                                }
                              >
                                <ShieldCheck className="h-4 w-4 mr-2" /> Audit
                              </Button>

                              {isCompleted && e.results_published !== 1 && (
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={() =>
                                    handlePublishResults(e.election_id)
                                  }
                                >
                                  <Trophy className="h-4 w-4 mr-2" /> Publish
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {activeSection === "elections" && <AdminElectionsView />}
              {activeSection === "voters" && <AdminVotersView />}
            </main>
          </div>
        </div>
      </Layout>
    </PageWrapper>
  );
}
