import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/StatCard";
import { PageWrapper } from "@/components/PageWrapper";
import { toast } from "sonner";
import {
  Users,
  Vote,
  BarChart3,
  UserCheck,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  LogOut,
  Bell,
  Shield,
  FileText,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdminElectionsView } from "@/components/admin/AdminElectionsView";
import { AdminVotersView } from "@/components/admin/AdminVotersView";

// --- Dummy Data ---
const pendingVerifications = [
  {
    id: "1",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    submittedAt: "2024-11-03 14:32",
    matchScore: 94,
    status: "pending",
  },
  {
    id: "2",
    name: "Robert Johnson",
    email: "r.johnson@email.com",
    submittedAt: "2024-11-03 13:15",
    matchScore: 87,
    status: "pending",
  },
];

const elections = [
  {
    id: "1",
    title: "2024 Presidential Election",
    status: "active",
    totalVoters: 2400000,
    votesCast: 1250000,
    turnout: 52.1,
  },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<
    "overview" | "verifications" | "elections" | "voters"
  >("overview");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/admin/login");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
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
        {/* Set height to 100vh to prevent content from pushing logout off-screen */}
        <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
          {/* --- SIDEBAR --- */}
          <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col shadow-sm">
            <div className="p-6 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <Shield className="h-7 w-7 text-[#800020]" />
                <div className="leading-tight">
                  <p className="font-bold text-sm text-neutral-900 uppercase tracking-widest">
                    Admin Portal
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    Election Commission
                  </p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
                    activeSection === item.key
                      ? "bg-red-50 text-[#800020] border-l-4 border-[#800020]"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 border-l-4 border-transparent"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* PINNED LOGOUT BUTTON */}
            <div className="p-4 mt-auto border-t border-neutral-100 bg-neutral-50/50">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-100 font-bold transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </aside>

          {/* --- MAIN CONTENT --- */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-8">
              <h1 className="text-xl font-display font-bold text-neutral-800 capitalize">
                {activeSection}
              </h1>

              <div className="flex items-center gap-5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-neutral-400"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full border border-white" />
                </Button>

                <div className="flex items-center gap-3 pl-5 border-l border-neutral-200">
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-900 leading-none">
                      Administrator
                    </p>
                    <p className="text-[10px] text-neutral-400 uppercase font-bold mt-1">
                      Super Admin
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#400010] flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-sm">
                    AD
                  </div>
                  {/* SECONDARY LOGOUT (ICON ONLY) */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-neutral-400 hover:text-red-600 ml-2"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </header>

            <main className="flex-1 p-8 overflow-y-auto">
              {activeSection === "overview" && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      title="Total Registered"
                      value="2.4M"
                      icon={<Users />}
                      trend={{ value: 5.2, isPositive: true }}
                    />
                    <StatCard
                      title="Verifications Pending"
                      value="47"
                      icon={<UserCheck />}
                    />
                    <StatCard
                      title="Active Elections"
                      value="2"
                      icon={<Vote />}
                    />
                    <StatCard
                      title="Total Votes Cast"
                      value="1.25M"
                      icon={<BarChart3 />}
                      trend={{ value: 12.3, isPositive: true }}
                    />
                  </div>

                  {/* Active Election Table */}
                  <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                      <h2 className="font-bold text-neutral-800 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#800020]" />
                        Active Election Status
                      </h2>
                      <Button
                        size="sm"
                        className="bg-[#800020] hover:bg-[#600015] text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" /> New Election
                      </Button>
                    </div>
                    <div className="p-6">
                      {elections.map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-100 hover:border-red-200 transition-all"
                        >
                          <div>
                            <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase mr-2">
                              Active
                            </span>
                            <span className="font-bold text-neutral-900">
                              {e.title}
                            </span>
                            <div className="text-sm text-neutral-500 mt-1">
                              {e.votesCast.toLocaleString()} votes cast |{" "}
                              {e.totalVoters.toLocaleString()} registered
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#800020]">
                              {e.turnout}%
                            </div>
                            <div className="text-[10px] uppercase font-bold text-neutral-400">
                              Turnout
                            </div>
                          </div>
                        </div>
                      ))}
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
