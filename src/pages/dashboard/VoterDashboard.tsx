import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/StatCard";
import { SecurityBadge } from "@/components/ui/SecurityBadge";
import {
  Vote,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  LogOut,
  Bell,
  FileText,
  History,
  Shield,
  ChevronRight,
} from "lucide-react";

const elections = [
  {
    id: "1",
    title: "2024 Presidential Election",
    type: "Federal",
    status: "active",
    startDate: "2024-11-01",
    endDate: "2024-11-05",
    hasVoted: false,
  },
  {
    id: "2",
    title: "State Senate Election",
    type: "State",
    status: "active",
    startDate: "2024-11-01",
    endDate: "2024-11-05",
    hasVoted: true,
  },
  {
    id: "3",
    title: "Local Council Elections",
    type: "Local",
    status: "upcoming",
    startDate: "2024-12-01",
    endDate: "2024-12-03",
    hasVoted: false,
  },
];

const notifications = [
  {
    id: "1",
    title: "Election Reminder",
    message: "The 2024 Presidential Election ends in 2 days.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "2",
    title: "Vote Confirmed",
    message: "Your vote for State Senate Election has been recorded.",
    time: "1 day ago",
    unread: false,
  },
];

export default function VoterDashboard() {
  const [activeTab, setActiveTab] = useState<"elections" | "history" | "profile">("elections");

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Dashboard Header */}
        <div className="hero-gradient text-primary-foreground">
          <div className="container py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold">Welcome back, John</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <SecurityBadge type="verified" size="sm" />
                    <span className="text-sm text-primary-foreground/70">Voter ID: VOT-2024-78432</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="hero-outline" size="sm">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Notifications</span>
                  <span className="ml-2 bg-accent text-accent-foreground text-xs px-1.5 rounded-full">2</span>
                </Button>
                <Button variant="hero-outline" size="sm">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Active Elections"
              value="2"
              description="Available to vote"
              icon={<Vote className="h-5 w-5" />}
            />
            <StatCard
              title="Votes Cast"
              value="1"
              description="In current cycle"
              icon={<CheckCircle className="h-5 w-5" />}
            />
            <StatCard
              title="Upcoming Elections"
              value="1"
              description="Next: Dec 1, 2024"
              icon={<Calendar className="h-5 w-5" />}
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border mb-6">
            <button
              onClick={() => setActiveTab("elections")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "elections"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Vote className="h-4 w-4 inline mr-2" />
              Active Elections
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "history"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <History className="h-4 w-4 inline mr-2" />
              Vote History
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "profile"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="h-4 w-4 inline mr-2" />
              My Profile
            </button>
          </div>

          {/* Content */}
          {activeTab === "elections" && (
            <div className="space-y-4">
              {elections.map((election) => (
                <div
                  key={election.id}
                  className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`status-badge ${
                            election.status === "active"
                              ? "status-badge--active"
                              : "status-badge--pending"
                          }`}
                        >
                          {election.status}
                        </span>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                          {election.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {election.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {election.startDate} - {election.endDate}
                        </span>
                        {election.status === "active" && (
                          <span className="flex items-center gap-1 text-warning">
                            <Clock className="h-4 w-4" />
                            Ends in 2 days
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {election.hasVoted ? (
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Vote Cast</span>
                        </div>
                      ) : election.status === "active" ? (
                        <Link to={`/vote/${election.id}`}>
                          <Button variant="accent">
                            Cast Your Vote
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="outline" disabled>
                          Opens {election.startDate}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "history" && (
            <div className="bg-card rounded-xl p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Voting History</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium text-foreground">State Senate Election</p>
                      <p className="text-sm text-muted-foreground">Voted on Nov 3, 2024</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View Receipt
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full Name</span>
                    <span className="text-foreground">John Doe</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="text-foreground">john.doe@example.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="text-foreground">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Constituency</span>
                    <span className="text-foreground">District 7, Metro Area</span>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h3 className="font-semibold text-foreground mb-4">Security Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Identity Verified</span>
                    <SecurityBadge type="verified" size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Two-Factor Auth</span>
                    <span className="text-success text-sm font-medium">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Biometric Enrolled</span>
                    <span className="text-success text-sm font-medium">Complete</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Panel */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Notifications</h3>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${
                    notification.unread
                      ? "bg-accent/5 border-accent/20"
                      : "bg-card border-border"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      notification.unread ? "bg-accent" : "bg-muted-foreground"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
