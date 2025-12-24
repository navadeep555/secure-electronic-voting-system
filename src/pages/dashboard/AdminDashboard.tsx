import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/StatCard";
import {
  Users,
  Vote,
  Calendar,
  Settings,
  BarChart3,
  UserCheck,
  UserX,
  Clock,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogOut,
  Bell,
  Shield,
} from "lucide-react";
import { Input } from "@/components/ui/input";

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
  {
    id: "3",
    name: "Maria Garcia",
    email: "m.garcia@email.com",
    submittedAt: "2024-11-03 11:45",
    matchScore: 72,
    status: "review",
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
  {
    id: "2",
    title: "State Senate Election",
    status: "active",
    totalVoters: 1800000,
    votesCast: 890000,
    turnout: 49.4,
  },
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
    <Layout>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground">
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-sidebar-primary" />
              <div>
                <p className="font-semibold text-sm">Admin Portal</p>
                <p className="text-xs text-sidebar-foreground/70">Electoral Commission</p>
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeSection === item.key
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-sidebar-border">
            <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
            <div>
              <h1 className="text-xl font-display font-semibold text-foreground">
                {sidebarItems.find((i) => i.key === activeSection)?.label || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-medium text-primary-foreground">AD</span>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-6 overflow-auto">
            {activeSection === "overview" && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Registered"
                    value="2.4M"
                    icon={<Users className="h-5 w-5" />}
                    trend={{ value: 5.2, isPositive: true }}
                  />
                  <StatCard
                    title="Pending Verifications"
                    value="47"
                    icon={<UserCheck className="h-5 w-5" />}
                  />
                  <StatCard
                    title="Active Elections"
                    value="2"
                    icon={<Vote className="h-5 w-5" />}
                  />
                  <StatCard
                    title="Votes Cast Today"
                    value="125K"
                    icon={<BarChart3 className="h-5 w-5" />}
                    trend={{ value: 12.3, isPositive: true }}
                  />
                </div>

                {/* Elections Overview */}
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-foreground">Active Elections</h2>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Election
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {elections.map((election) => (
                      <div
                        key={election.id}
                        className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="status-badge status-badge--active">Active</span>
                            <h3 className="font-medium text-foreground">{election.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {election.votesCast.toLocaleString()} of {election.totalVoters.toLocaleString()} votes
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-display font-bold text-accent">{election.turnout}%</p>
                          <p className="text-xs text-muted-foreground">Turnout</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <h2 className="font-semibold text-foreground mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.type === "success"
                              ? "bg-success"
                              : activity.type === "warning"
                              ? "bg-warning"
                              : "bg-accent"
                          }`}
                        />
                        <span className="text-foreground">{activity.action}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{activity.user}</span>
                        <span className="ml-auto text-muted-foreground">{activity.time}</span>
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search verifications..." className="pl-10" />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>

                <div className="bg-card rounded-xl shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-secondary/50">
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Applicant</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Submitted</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Match Score</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingVerifications.map((verification) => (
                          <tr key={verification.id} className="border-b border-border">
                            <td className="p-4">
                              <div>
                                <p className="font-medium text-foreground">{verification.name}</p>
                                <p className="text-sm text-muted-foreground">{verification.email}</p>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">{verification.submittedAt}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      verification.matchScore >= 90
                                        ? "bg-success"
                                        : verification.matchScore >= 80
                                        ? "bg-accent"
                                        : "bg-warning"
                                    }`}
                                    style={{ width: `${verification.matchScore}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{verification.matchScore}%</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span
                                className={`status-badge ${
                                  verification.status === "pending"
                                    ? "status-badge--pending"
                                    : "bg-warning/10 text-warning"
                                }`}
                              >
                                {verification.status === "pending" ? "Pending" : "Needs Review"}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-success hover:text-success">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
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

            {activeSection === "elections" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-foreground">All Elections</h2>
                  <Button variant="accent">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Election
                  </Button>
                </div>
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <p className="text-muted-foreground text-center py-8">
                    Election management interface coming soon...
                  </p>
                </div>
              </div>
            )}

            {activeSection === "voters" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search voters..." className="pl-10" />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <p className="text-muted-foreground text-center py-8">
                    Voter management interface coming soon...
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
