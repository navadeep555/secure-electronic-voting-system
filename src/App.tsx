import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- Page Imports ---
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import VoterDashboard from "./pages/dashboard/VoterDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ObserverDashboard from "./pages/dashboard/ObserverDashboard";
import AuditView from "./pages/dashboard/AuditView"; // Added for Epic 5
import PublicResults from "./pages/PublicResults";
import AlreadyVoted from "./pages/AlreadyVoted";
import NotFound from "./pages/NotFound";
import HowItWorks from "./pages/HowItWorks";
import VoteElection from "@/pages/voter/VoteElection";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* LANDING PAGE */}
          <Route path="/" element={<Index />} />
          <Route path="/how-it-works" element={<HowItWorks />} />

          {/* AUTHENTICATION */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* DASHBOARDS */}
          <Route path="/dashboard/voter" element={<VoterDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/observer" element={<ObserverDashboard />} />

          {/* VOTING PROCESS */}
          <Route path="/vote/:electionId" element={<VoteElection />} />
          <Route path="/already-voted" element={<AlreadyVoted />} />

          {/* RESULTS & AUDIT */}
          {/* US 5.3: Forensic Audit View for Admins */}
          <Route path="/admin/audit/:eid" element={<AuditView />} />

          {/* Publicly published results */}
          <Route path="/results/:eid" element={<PublicResults />} />

          {/* 404 FALLBACK */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
