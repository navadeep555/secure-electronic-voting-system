import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/StatCard";
import { PageWrapper } from "@/components/PageWrapper";
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
  Settings
} from "lucide-react";
import { Input } from "@/components/ui/input";

const pendingVerifications = [
  { id: "1", name: "Jane Smith", email: "jane.smith@email.com", submittedAt: "2024-11-03 14:32", matchScore: 94, status: "pending" },
  { id: "2", name: "Robert Johnson", email: "r.johnson@email.com", submittedAt: "2024-11-03 13:15", matchScore: 87, status: "pending" },
  { id: "3", name: "Maria Garcia", email: "m.garcia@email.com", submittedAt: "2024-11-03 11:45", matchScore: 72, status: "review" },
];

const elections = [
  { id: "1", title: "2024 Presidential Election", status: "active", totalVoters: 2400000, votesCast: 1250000, turnout: 52.1 },
  { id: "2", title: "State Senate Election", status: "active", totalVoters: 1800000, votesCast: 890000, turnout: 49.4 },
];

const recentActivity = [
  { action: "Voter verified", user: "Jane Smith", time: "5 min ago", type: "success" },
  { action: "Election created", user: "Admin", time: "1 hour ago", type: "info" },
  { action: "Verification rejected", user: "John Doe", time: "2 hours ago", type: "warning" },
  { action: "System backup completed", user: "System", time: "3 hours ago", type: "info" },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<"overview" | "verifications" | "elections" | "voters">("overview");

  const sidebarItems = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "verifications", label: "Verifications", icon: UserCheck },
    { key: "elections", label: "Elections", icon: Vote },
    { key: "voters", label: "Voters", icon: Users },
  ];

  return (
    <PageWrapper>
      <Layout>
        <div className="min-h-screen bg-neutral-100 flex">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200 shadow-sm z-10">
            <div className="p-6 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary-800" />
                <div>
                  <p className="font-bold text-sm text-neutral-900 uppercase tracking-wide">Admin Portal</p>
                  <p className="text-xs text-neutral-500">Election Commission</p>
                </div>
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key as typeof activeSection)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-colors ${activeSection === item.key
                      ? "bg-primary-50 text-primary-900 border-l-4 border-primary-700"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border-l-4 border-transparent"
                      }`}
                  >
                    <Icon className={`h-5 w-5 ${activeSection === item.key ? "text-primary-700" : "text-neutral-400"}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-neutral-200">
              <Button variant="ghost" size="sm" className="w-full justify-start text-neutral-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            {/* Top Bar */}
            <header className="h-16 border-b border-neutral-200 bg-white flex items-center justify-between px-8 shadow-sm">
              <h1 className="text-xl font-display font-bold text-neutral-900">
                {sidebarItems.find((i) => i.key === activeSection)?.label || "Dashboard"}
              </h1>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-neutral-500 hover:text-primary-700">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border border-white" />
                </Button>
                <div className="flex items-center gap-2 pl-4 border-l border-neutral-200">
                  <div className="w-8 h-8 rounded-full bg-primary-800 flex items-center justify-center text-white text-xs font-bold border-2 border-primary-100">
                    AD
                  </div>
                  <span className="text-sm font-semibold text-neutral-700">Administrator</span>
                </div>
              </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 p-8 overflow-y-auto bg-neutral-100">
              {activeSection === "overview" && (
                <div className="space-y-8">
                  {/* Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Registered" value="2.4M" icon={<Users className="h-5 w-5 text-neutral-600" />} trend={{ value: 5.2, isPositive: true }} className="border-t-4 border-t-neutral-600" />
                    <StatCard title="Verifications Pending" value="47" icon={<UserCheck className="h-5 w-5 text-orange-600" />} className="border-t-4 border-t-orange-600" />
                    <StatCard title="Active Elections" value="2" icon={<Vote className="h-5 w-5 text-primary-700" />} className="border-t-4 border-t-primary-700" />
                    <StatCard title="Total Votes Cast" value="1.25M" icon={<BarChart3 className="h-5 w-5 text-green-600" />} trend={{ value: 12.3, isPositive: true }} className="border-t-4 border-t-green-600" />
                  </div>

                  {/* Elections Overview */}
                  <div className="bg-white rounded-sm border border-neutral-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-bold text-neutral-800 text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary-700" /> Active Election Status
                      </h2>
                      <Button size="sm" className="bg-primary-700 hover:bg-primary-800 text-white rounded-sm">
                        <Plus className="h-4 w-4 mr-2" /> New Election
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {elections.map((election) => (
                        <div key={election.id} className="flex items-center justify-between p-5 bg-neutral-50 border border-neutral-200 rounded-sm hover:border-primary-300 transition-colors">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-sm uppercase">Active</span>
                              <h3 className="font-bold text-neutral-900">{election.title}</h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-neutral-500">
                              <span>{election.votesCast.toLocaleString()} votes cast</span>
                              <div className="h-4 w-px bg-neutral-300"></div>
                              <span>{election.totalVoters.toLocaleString()} registered voters</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-mono font-bold text-primary-800">{election.turnout}%</p>
                            <p className="text-xs font-bold text-neutral-400 uppercase">Turnout</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-sm border border-neutral-200 shadow-sm p-6">
                    <h2 className="font-bold text-neutral-800 text-lg mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-neutral-500" /> Audit Log
                    </h2>
                    <div className="space-y-0 divide-y divide-neutral-100">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 py-3 text-sm">
                          <div className={`w-2 h-2 rounded-full ${activity.type === "success" ? "bg-green-500" : activity.type === "warning" ? "bg-orange-500" : "bg-neutral-500"}`} />
                          <span className="font-medium text-neutral-900">{activity.action}</span>
                          <span className="text-neutral-400">•</span>
                          <span className="text-neutral-600">{activity.user}</span>
                          <span className="ml-auto font-mono text-xs text-neutral-400">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "verifications" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input placeholder="Search applicants..." className="pl-10 bg-white border-neutral-300 rounded-sm" />
                    </div>
                    <Button variant="outline" className="border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter Status
                    </Button>
                  </div>

                  <div className="bg-white rounded-sm shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                          <tr>
                            <th className="text-left p-4 font-bold text-neutral-500 uppercase tracking-wider">Applicant</th>
                            <th className="text-left p-4 font-bold text-neutral-500 uppercase tracking-wider">Submitted</th>
                            <th className="text-left p-4 font-bold text-neutral-500 uppercase tracking-wider">Face Match</th>
                            <th className="text-left p-4 font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                            <th className="text-right p-4 font-bold text-neutral-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {pendingVerifications.map((verification) => (
                            <tr key={verification.id} className="hover:bg-neutral-50 transition-colors">
                              <td className="p-4">
                                <div>
                                  <p className="font-bold text-neutral-900">{verification.name}</p>
                                  <p className="text-xs text-neutral-500">{verification.email}</p>
                                </div>
                              </td>
                              <td className="p-4 text-neutral-600 font-mono text-xs">{verification.submittedAt}</td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                                    <div className={`h-full ${verification.matchScore >= 90 ? "bg-green-600" : "bg-orange-500"}`} style={{ width: `${verification.matchScore}%` }} />
                                  </div>
                                  <span className="font-bold text-neutral-700">{verification.matchScore}%</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-sm text-xs font-bold uppercase ${verification.status === "pending" ? "bg-orange-100 text-orange-800" : "bg-yellow-100 text-yellow-800"}`}>
                                  {verification.status}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="hover:bg-neutral-100 text-neutral-600">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="hover:bg-green-50 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="hover:bg-red-50 text-red-600">
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Placeholder Sections */}
              {(activeSection === "elections" || activeSection === "voters") && (
                <div className="bg-white rounded-sm shadow-sm border border-neutral-200 p-12 text-center">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900">Module Under Construction</h3>
                  <p className="text-neutral-500">This administrative module is currently being updated to the new secure standard.</p>
                </div>
              )}

            </main>
          </div>
        </div>
      </Layout>
    </PageWrapper>
  );
}
