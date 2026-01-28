import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/StatCard";
import { PageWrapper } from "@/components/PageWrapper";
import {
  Vote,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  LogOut,
  Bell,
  History,
  Shield,
  ChevronRight,
  Flag,
  FileCheck
} from "lucide-react";

const elections = [
  { id: "1", title: "2024 Presidential Election", type: "Federal", status: "active", startDate: "2024-11-01", endDate: "2024-11-05", hasVoted: false },
  { id: "2", title: "State Senate Election", type: "State", status: "active", startDate: "2024-11-01", endDate: "2024-11-05", hasVoted: true },
  { id: "3", title: "Local Council Elections", type: "Local", status: "upcoming", startDate: "2024-12-01", endDate: "2024-12-03", hasVoted: false },
];

const notifications = [
  { id: "1", title: "Election Reminder", message: "The 2024 Presidential Election ends in 2 days.", time: "2 hours ago", unread: true },
  { id: "2", title: "Vote Confirmed", message: "Your vote for State Senate Election has been recorded.", time: "1 day ago", unread: false },
];

export default function VoterDashboard() {
  const [activeTab, setActiveTab] = useState<"elections" | "history" | "profile">("elections");

  return (
    <PageWrapper>
      <Layout>
        <div className="min-h-screen bg-neutral-100">
          {/* Dashboard Header - Official Banner Style */}
          <div className="bg-white border-b border-neutral-200">
            <div className="container max-w-6xl py-8 px-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-primary-50 border-2 border-primary-100 flex items-center justify-center shrink-0">
                    <User className="h-10 w-10 text-primary-800" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-display font-bold text-neutral-900">Welcome, John Doe</h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-sm uppercase flex items-center gap-1 border border-green-200">
                        <Shield className="h-3 w-3" /> Identity Verified
                      </span>
                      <span className="text-sm font-mono text-neutral-500">ID: VOT-2024-78432</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700 relative">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                    <span className="ml-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">2</span>
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white border-neutral-200 hover:bg-red-50 hover:text-red-700 text-neutral-700">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="container max-w-6xl py-8 px-4">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <StatCard title="Active Elections" value="2" description="Available to vote" icon={<Vote className="h-5 w-5 text-primary-700" />} className="border-t-4 border-t-primary-700" />
              <StatCard title="Votes Cast" value="1" description="In current cycle" icon={<CheckCircle className="h-5 w-5 text-green-600" />} className="border-t-4 border-t-green-600" />
              <StatCard title="Upcoming" value="1" description="Next: Dec 1, 2024" icon={<Calendar className="h-5 w-5 text-neutral-600" />} className="border-t-4 border-t-neutral-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Column */}
              <div className="lg:col-span-2 space-y-6">

                {/* Tabs */}
                <div className="flex border-b border-neutral-200 bg-white rounded-t-sm px-2">
                  {[
                    { key: "elections", label: "Active Elections", icon: Flag },
                    { key: "history", label: "Voting History", icon: History },
                    { key: "profile", label: "My Profile", icon: User },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`px-6 py-4 text-sm font-bold uppercase tracking-wide flex items-center gap-2 border-b-2 transition-colors ${activeTab === tab.key
                          ? "border-primary-700 text-primary-800"
                          : "border-transparent text-neutral-500 hover:text-neutral-800"
                        }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-b-sm shadow-sm border border-neutral-200 border-t-0 p-6 min-h-[400px]">
                  {activeTab === "elections" && (
                    <div className="space-y-4">
                      {elections.map((election) => (
                        <div key={election.id} className="group border border-neutral-200 p-5 rounded-sm hover:border-primary-300 transition-all bg-neutral-50 hover:bg-white hover:shadow-sm">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-sm border ${election.status === "active" ? "bg-green-50 text-green-700 border-green-200" : "bg-neutral-100 text-neutral-600 border-neutral-200"
                                  }`}>
                                  {election.status}
                                </span>
                                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-sm bg-neutral-100 text-neutral-600 border border-neutral-200">
                                  {election.type}
                                </span>
                              </div>
                              <h3 className="text-lg font-bold text-neutral-900 mb-1 group-hover:text-primary-800 transition-colors">
                                {election.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-neutral-500 font-medium">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {election.startDate} - {election.endDate}
                                </span>
                                {election.status === "active" && (
                                  <span className="flex items-center gap-1 text-orange-600">
                                    <Clock className="h-3.5 w-3.5" />
                                    Ends in 2 days
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {election.hasVoted ? (
                                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-sm border border-green-100">
                                  <CheckCircle className="h-5 w-5" />
                                  <span className="font-bold text-sm uppercase">Vote Cast</span>
                                </div>
                              ) : election.status === "active" ? (
                                <Link to={`/vote/${election.id}`}>
                                  <Button className="bg-primary-700 hover:bg-primary-900 text-white font-bold uppercase tracking-wide text-xs px-6 py-5 rounded-sm shadow-sm transition-all transform hover:-translate-y-0.5">
                                    Cast Ballot <ChevronRight className="h-4 w-4 ml-1" />
                                  </Button>
                                </Link>
                              ) : (
                                <Button disabled className="bg-neutral-200 text-neutral-400 font-bold uppercase text-xs px-6 py-5 rounded-sm">
                                  Not Open Yet
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "history" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-5 bg-neutral-50 border border-neutral-200 rounded-sm">
                        <div className="flex items-center gap-4">
                          <div className="bg-white p-2 rounded-full border border-neutral-200">
                            <FileCheck className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900">State Senate Election</p>
                            <p className="text-sm text-neutral-500">Vote cast on Nov 3, 2024 at 14:30</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="border-neutral-300 text-neutral-600 font-bold text-xs uppercase">
                          View Receipt
                        </Button>
                      </div>
                    </div>
                  )}

                  {activeTab === "profile" && (
                    <div className="bg-neutral-50 p-6 rounded-sm border border-neutral-200">
                      <h3 className="text-lg font-bold text-neutral-900 mb-6 border-b border-neutral-200 pb-2">Voter Registration Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                        {[
                          { label: "Full Name", value: "John Doe" },
                          { label: "Email Address", value: "john.doe@example.com" },
                          { label: "Phone Number", value: "+1 (555) 123-4567" },
                          { label: "Constituency", value: "District 7, Metro Area" },
                          { label: "Registration Date", value: "Jan 15, 2020" },
                          { label: "Status", value: "Active & Verified", highlight: true }
                        ].map((item: any) => (
                          <div key={item.label}>
                            <p className="text-xs font-bold text-neutral-500 uppercase mb-1">{item.label}</p>
                            <p className={`font-semibold ${item.highlight ? 'text-green-700 font-bold flex items-center gap-1' : 'text-neutral-900'}`}>
                              {item.highlight && <Shield className="h-3 w-3" />} {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Column */}
              <div className="space-y-6">
                {/* Notifications Widget */}
                <div className="bg-white rounded-sm shadow-sm border border-neutral-200 p-5">
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary-700" /> Recent Alerts
                  </h3>
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-3 rounded-sm border ${notification.unread ? 'bg-primary-50 border-primary-100' : 'bg-white border-neutral-100'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm font-bold ${notification.unread ? 'text-primary-900' : 'text-neutral-700'}`}>{notification.title}</p>
                          {notification.unread && <div className="w-2 h-2 rounded-full bg-primary-600 mt-1"></div>}
                        </div>
                        <p className="text-xs text-neutral-600 mb-2">{notification.message}</p>
                        <p className="text-[10px] text-neutral-400 font-mono uppercase">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-sm shadow-sm border border-neutral-200 p-5">
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-4">Voter Resources</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#" className="text-primary-700 hover:underline flex items-center gap-2"><ChevronRight className="h-3 w-3" /> Find Polling Station</a></li>
                    <li><a href="#" className="text-primary-700 hover:underline flex items-center gap-2"><ChevronRight className="h-3 w-3" /> Election Guidelines</a></li>
                    <li><a href="#" className="text-primary-700 hover:underline flex items-center gap-2"><ChevronRight className="h-3 w-3" /> Report an Issue</a></li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      </Layout>
    </PageWrapper>
  );
}
