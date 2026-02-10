import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login"; // This remains the Biometric Voter Login
import AdminLogin from "./pages/AdminLogin"; // 1. Import the new Admin Login page
import Register from "./pages/Register";
import VoterDashboard from "./pages/dashboard/VoterDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ObserverDashboard from "./pages/dashboard/ObserverDashboard";
import VotingPage from "./pages/VotingPage";
import AlreadyVoted from "./pages/AlreadyVoted";
import NotFound from "./pages/NotFound";
import VoteElection from "@/pages/voter/VoteElection";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* VOTER AUTH: Biometric + Aadhaar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ADMIN AUTH: Username + Password */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* DASHBOARDS */}
          <Route path="/dashboard/voter" element={<VoterDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/observer" element={<ObserverDashboard />} />

          {/* VOTING PROCESS */}
          <Route path="/vote/:electionId" element={<VotingPage />} />
          <Route path="/already-voted" element={<AlreadyVoted />} />
          <Route
            path="/dashboard/voter/election/:electionId"
            element={<VoteElection />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
