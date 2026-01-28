import { useState } from "react";
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
  FileText
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefresh(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

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
                  <h1 className="text-3xl font-display font-bold">Election Monitoring</h1>
                  <p className="text-primary-200 text-sm mt-1 max-w-2xl">
                    Real-time transparency dashboard providing independent verification of electoral data.
                  </p>
                </div>
                <div className="flex items-center gap-4 bg-primary-800/50 p-4 rounded-sm border border-primary-700">
                  <div className="text-right">
                    <p className="text-xs text-primary-300 uppercase font-bold">Data Timestamp</p>
                    <p className="font-mono font-bold text-white">{lastRefresh.toLocaleTimeString()}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="bg-primary-700 hover:bg-primary-600 text-white border border-primary-600"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
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
                  key={election.id}
                  onClick={() => setSelectedElection(election)}
                  className={`px-6 py-3 rounded-t-sm text-sm font-bold uppercase tracking-wide transition-colors border-b-2 ${selectedElection.id === election.id
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
                value={selectedElection.totalVoters.toLocaleString()}
                icon={<Users className="h-5 w-5 text-neutral-600" />}
                className="border-t-4 border-t-neutral-600"
              />
              <StatCard
                title="Votes Cast"
                value={selectedElection.votesCast.toLocaleString()}
                icon={<Vote className="h-5 w-5 text-primary-700" />}
                trend={{ value: 8.3, isPositive: true }}
                className="border-t-4 border-t-primary-700"
              />
              <StatCard
                title="Voter Turnout"
                value={`${selectedElection.turnout}%`}
                icon={<TrendingUp className="h-5 w-5 text-green-600" />}
                className="border-t-4 border-t-green-600"
              />
              <StatCard
                title="Duration Active"
                value="48h 32m"
                description={`Started ${selectedElection.startTime}`}
                icon={<Clock className="h-5 w-5 text-orange-600" />}
                className="border-t-4 border-t-orange-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Turnout by Region */}
              <div className="bg-white rounded-sm p-6 shadow-sm border border-neutral-200">
                <div className="flex items-center justify-between mb-6 border-b border-neutral-100 pb-4">
                  <h2 className="font-bold text-neutral-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary-700" />
                    Turnout by Region
                  </h2>
                </div>
                <div className="space-y-5">
                  {selectedElection.regions.map((region) => (
                    <div key={region.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold text-neutral-700">{region.name}</span>
                        <span className="text-sm font-mono font-bold text-neutral-900">{region.turnout}%</span>
                      </div>
                      <div className="h-3 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                        <div
                          className="h-full bg-primary-700 transition-all duration-1000"
                          style={{ width: `${region.turnout}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hourly Voting Activity */}
              <div className="bg-white rounded-sm p-6 shadow-sm border border-neutral-200">
                <div className="flex items-center justify-between mb-6 border-b border-neutral-100 pb-4">
                  <h2 className="font-bold text-neutral-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary-700" />
                    Hourly Voting Activity
                  </h2>
                </div>
                <div className="flex items-end justify-between h-56 gap-2 pt-4">
                  {[35, 45, 60, 80, 95, 85, 70, 55, 65, 75, 90, 78].map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full h-full flex items-end">
                        <div
                          className="w-full bg-primary-100 rounded-t-sm transition-all group-hover:bg-primary-200 border border-transparent group-hover:border-primary-300"
                          style={{ height: `${value}%` }}
                        >
                          <div
                            className="absolute bottom-0 w-full bg-primary-700 rounded-t-sm transition-all opacity-80 group-hover:opacity-100"
                            style={{ height: `${value * 0.8}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-neutral-400 group-hover:text-primary-800">{8 + index}h</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Election Status */}
              <div className="bg-white rounded-sm p-6 shadow-sm border border-neutral-200">
                <h2 className="font-bold text-neutral-900 mb-6 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary-700" /> System Status Indicators
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-sm">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-3 h-3 bg-green-600 rounded-full" />
                        <div className="absolute top-0 left-0 w-3 h-3 bg-green-600 rounded-full animate-ping opacity-50" />
                      </div>
                      <span className="font-bold text-green-900">System Online</span>
                    </div>
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wide">All Operational</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {[
                      { label: "Election Type", value: "Federal" },
                      { label: "Voting Ends", value: "Nov 5, 2024 20:00" },
                      { label: "Polling Stations", value: "12,450 Active" },
                      { label: "Candidates", value: "6 Registered" }
                    ].map((item) => (
                      <div key={item.label} className="p-3 bg-neutral-50 rounded-sm border border-neutral-200">
                        <p className="text-xs font-bold text-neutral-500 uppercase mb-1">{item.label}</p>
                        <p className="font-bold text-neutral-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Download Reports */}
              <div className="bg-white rounded-sm p-6 shadow-sm border border-neutral-200">
                <h2 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-700" /> Public Data Reports
                </h2>
                <p className="text-sm text-neutral-500 mb-6">
                  Access redacted election datasets and audit logs for independent verification.
                </p>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-neutral-50 hover:bg-white border-neutral-300 text-neutral-700 font-medium">
                    <Download className="h-4 w-4 mr-2" />
                    Voter Turnout Report (PDF)
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-neutral-50 hover:bg-white border-neutral-300 text-neutral-700 font-medium">
                    <Download className="h-4 w-4 mr-2" />
                    Regional Statistics (CSV)
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-neutral-50 hover:bg-white border-neutral-300 text-neutral-700 font-medium">
                    <Download className="h-4 w-4 mr-2" />
                    Public Audit Log (Redacted)
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
                <h3 className="font-bold text-primary-900 mb-2">Transparency Commitment</h3>
                <p className="text-sm text-primary-800/80 leading-relaxed">
                  This dashboard provides real-time public access to aggregated election statistics.
                  Individual voter information and ballot contents are never disclosed to protect
                  voter privacy and ballot secrecy. All displayed data is independently verifiable
                  through our cryptographic audit system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </PageWrapper>
  );
}
