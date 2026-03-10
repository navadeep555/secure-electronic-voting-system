import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/PageWrapper";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { CalendarDays, Vote, Archive, ArrowRight, ShieldCheck, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { electionService } from "@/services/electionService";

type Tab = "current" | "past" | "calendar";

// Define the shape of our real election data
interface RealElection {
    election_id: string;
    title: string;
    description: string;
    start_time: number;
    end_time: number;
    status: "ACTIVE" | "CLOSED" | "DRAFT" | "PAUSED";
    results_published: number;
    candidate_count: number;
}

export function ElectionsPortal() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>("current");
    const [elections, setElections] = useState<RealElection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (location.pathname.includes("/results")) setActiveTab("past");
        else if (location.pathname.includes("/calendar")) setActiveTab("calendar");
        else setActiveTab("current");
    }, [location.pathname]);

    useEffect(() => {
        const fetchElections = async () => {
            try {
                setLoading(true);
                const response = await electionService.getPublicElections();
                if (response.data && response.data.success) {
                    setElections(response.data.data);
                } else {
                    setError("Failed to load elections data.");
                }
            } catch (err) {
                console.error("Error fetching elections:", err);
                setError("An error occurred while connecting to the server.");
            } finally {
                setLoading(false);
            }
        };

        fetchElections();
    }, []);

    const getFilteredElections = (): RealElection[] => {
        switch (activeTab) {
            case "current":
                return elections.filter((e) => e.status === "ACTIVE" || e.status === "PAUSED");
            case "past":
                return elections.filter((e) => e.status === "CLOSED");
            case "calendar":
                return elections.filter((e) => e.status === "DRAFT");
            default:
                return [];
        }
    };

    const tabs: { id: Tab; label: string; icon: any; path: string }[] = [
        { id: "current", label: "Current Elections", icon: Vote, path: "/elections" },
        { id: "calendar", label: "Election Calendar", icon: CalendarDays, path: "/calendar" },
        { id: "past", label: "Past Results", icon: Archive, path: "/results" },
    ];

    const filteredElections = getFilteredElections();

    return (
        <PageWrapper>
            <Layout>
                <div className="bg-neutral-50 min-h-screen pt-24 pb-20">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mb-12"
                        >
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
                                Electoral Portal
                            </h1>
                            <p className="text-xl text-neutral-500 max-w-2xl">
                                View ongoing civic processes, upcoming schedules, and transparent cryptography-backed past results.
                            </p>
                        </motion.div>

                        {/* Navigation Tabs */}
                        <div className="flex overflow-x-auto pb-4 mb-8 snap-x">
                            <div className="flex space-x-2 bg-white p-1.5 rounded-lg shadow-sm border border-neutral-200">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => navigate(tab.path)}
                                            className={`flex items-center px-4 py-2.5 rounded-md text-sm font-bold transition-all whitespace-nowrap snap-start ${isActive
                                                ? "bg-primary-50 text-primary-800"
                                                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 mr-2 ${isActive ? "text-primary-600" : ""}`} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Elections List */}
                        <div className="space-y-4">
                            {loading ? (
                                <div className="bg-white rounded-xl border border-neutral-200 p-24 flex flex-col items-center justify-center text-neutral-500">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary-700 mb-4" />
                                    <p>Synchronizing with secured ledger...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 rounded-xl border border-red-200 p-12 text-center text-red-600">
                                    {error}
                                </div>
                            ) : filteredElections.length === 0 ? (
                                <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-500">
                                    No elections found in this category.
                                </div>
                            ) : (
                                filteredElections.map((election, i) => (
                                    <motion.div
                                        key={election.election_id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: i * 0.1 }}
                                        className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between group hover:border-primary-200 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-xl font-bold text-neutral-900 group-hover:text-primary-800 transition-colors">
                                                    {election.title}
                                                </h2>
                                                {election.status === "ACTIVE" && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        Voting Live
                                                    </span>
                                                )}
                                                {election.status === "CLOSED" && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-neutral-100 text-neutral-600 border border-neutral-200">
                                                        Concluded
                                                    </span>
                                                )}
                                                {election.status === "DRAFT" && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-800 border border-blue-200">
                                                        Scheduled
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-neutral-500 mb-4 max-w-2xl text-sm leading-relaxed">
                                                {election.description}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                                <div className="flex items-center gap-1.5">
                                                    <CalendarDays className="w-3.5 h-3.5" />
                                                    <span>
                                                        {new Date(election.start_time * 1000).toLocaleDateString()} -{" "}
                                                        {new Date(election.end_time * 1000).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Vote className="w-3.5 h-3.5" />
                                                    <span>{election.candidate_count} Candidates</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:ml-auto shrink-0 flex items-center justify-end border-t border-neutral-100 md:border-t-0 pt-4 md:pt-0">
                                            {election.status === "ACTIVE" && (
                                                <Button
                                                    onClick={() => navigate("/login")}
                                                    className="w-full md:w-auto bg-primary-700 hover:bg-primary-800 rounded-sm shadow-md"
                                                >
                                                    Authenticate to Vote <ArrowRight className="ml-2 w-4 h-4" />
                                                </Button>
                                            )}

                                            {election.status === "CLOSED" && election.results_published === 1 && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => navigate(`/results/${election.election_id}`)}
                                                    className="w-full md:w-auto border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-emerald-50/30 rounded-sm"
                                                >
                                                    <ShieldCheck className="mr-2 w-4 h-4" /> View Verified Audit Record
                                                </Button>
                                            )}

                                            {election.status === "CLOSED" && election.results_published === 0 && (
                                                <Button
                                                    variant="secondary"
                                                    disabled
                                                    className="w-full md:w-auto opacity-70 rounded-sm"
                                                >
                                                    <Lock className="mr-2 w-4 h-4" /> Finalizing Tally...
                                                </Button>
                                            )}

                                            {election.status === "DRAFT" && (
                                                <Button
                                                    variant="outline"
                                                    disabled
                                                    className="w-full md:w-auto rounded-sm"
                                                >
                                                    Registration Period
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </Layout>
        </PageWrapper>
    );
}
