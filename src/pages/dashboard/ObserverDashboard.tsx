import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Users,
  Vote,
  Clock,
  TrendingUp,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  MapPin,
} from "lucide-react";

const elections = [
  {
    id: "1",
    title: "2024 Presidential Election",
    status: "active",
    totalVoters: 2400000,
    votesCast: 1250000,
    turnout: 52.1,
    startTime: "2024-11-01 08:00",
    regions: [
      { name: "Metro Area", turnout: 58.2 },
      { name: "Northern Region", turnout: 45.8 },
      { name: "Southern Region", turnout: 51.3 },
      { name: "Eastern Region", turnout: 49.7 },
      { name: "Western Region", turnout: 47.2 },
    ],
  },
  {
    id: "2",
    title: "State Senate Election",
    status: "active",
    totalVoters: 1800000,
    votesCast: 890000,
    turnout: 49.4,
    startTime: "2024-11-01 08:00",
    regions: [
      { name: "District 1", turnout: 52.1 },
      { name: "District 2", turnout: 48.3 },
      { name: "District 3", turnout: 46.9 },
    ],
  },
];

export default function ObserverDashboard() {
  const [selectedElection, setSelectedElection] = useState(elections[0]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = () => {
    setLastRefresh(new Date());
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-6">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium text-accent">Public Observer Portal</span>
                </div>
                <h1 className="text-2xl font-display font-bold">Election Monitoring</h1>
                <p className="text-primary-foreground/70 text-sm mt-1">
                  Real-time transparency dashboard for public observation
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-primary-foreground/70">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
                <Button variant="hero-outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          {/* Election Selector */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {elections.map((election) => (
              <button
                key={election.id}
                onClick={() => setSelectedElection(election)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedElection.id === election.id
                    ? "bg-accent text-accent-foreground"
                    : "bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                {election.title}
              </button>
            ))}
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Eligible Voters"
              value={selectedElection.totalVoters.toLocaleString()}
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              title="Votes Cast"
              value={selectedElection.votesCast.toLocaleString()}
              icon={<Vote className="h-5 w-5" />}
              trend={{ value: 8.3, isPositive: true }}
            />
            <StatCard
              title="Voter Turnout"
              value={`${selectedElection.turnout}%`}
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <StatCard
              title="Voting Duration"
              value="48h 32m"
              description={`Started ${selectedElection.startTime}`}
              icon={<Clock className="h-5 w-5" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Turnout by Region */}
            <div className="bg-card rounded-xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  Turnout by Region
                </h2>
              </div>
              <div className="space-y-4">
                {selectedElection.regions.map((region) => (
                  <div key={region.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">{region.name}</span>
                      <span className="text-sm font-medium text-foreground">{region.turnout}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all duration-500"
                        style={{ width: `${region.turnout}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Voting Activity */}
            <div className="bg-card rounded-xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  Hourly Voting Activity
                </h2>
              </div>
              <div className="flex items-end justify-between h-48 gap-1">
                {[35, 45, 60, 80, 95, 85, 70, 55, 65, 75, 90, 78].map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-accent/20 rounded-t transition-all hover:bg-accent/30"
                      style={{ height: `${value}%` }}
                    >
                      <div
                        className="w-full bg-accent rounded-t transition-all"
                        style={{ height: `${value * 0.8}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{8 + index}h</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Election Status */}
            <div className="bg-card rounded-xl p-6 shadow-card">
              <h2 className="font-semibold text-foreground mb-4">Election Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                    <span className="font-medium text-foreground">System Online</span>
                  </div>
                  <span className="text-sm text-success">All systems operational</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-muted-foreground">Election Type</p>
                    <p className="font-medium text-foreground">Federal</p>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-muted-foreground">Voting Ends</p>
                    <p className="font-medium text-foreground">Nov 5, 2024 20:00</p>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-muted-foreground">Polling Stations</p>
                    <p className="font-medium text-foreground">12,450 Active</p>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-muted-foreground">Candidates</p>
                    <p className="font-medium text-foreground">6 Registered</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Reports */}
            <div className="bg-card rounded-xl p-6 shadow-card">
              <h2 className="font-semibold text-foreground mb-4">Public Reports</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Download publicly available election reports and audit logs (sensitive data redacted).
              </p>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Voter Turnout Report (PDF)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Regional Statistics (CSV)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Public Audit Log (Redacted)
                </Button>
              </div>
            </div>
          </div>

          {/* Transparency Notice */}
          <div className="mt-8 p-6 bg-accent/10 rounded-xl border border-accent/20">
            <div className="flex items-start gap-4">
              <Eye className="h-6 w-6 text-accent mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Transparency Commitment</h3>
                <p className="text-sm text-muted-foreground">
                  This dashboard provides real-time public access to aggregated election statistics.
                  Individual voter information and ballot contents are never disclosed to protect
                  voter privacy and ballot secrecy. All displayed data is independently verifiable
                  through our cryptographic audit system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
