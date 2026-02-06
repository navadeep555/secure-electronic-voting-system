import { Layout } from "@/components/layout/Layout";
import { PageWrapper } from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { AlertOctagon, Home, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AlreadyVoted() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white p-8 rounded-sm shadow-lg border-t-4 border-red-600 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="h-10 w-10 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Access Denied</h1>
            <h2 className="text-lg font-medium text-red-600 mb-4 flex items-center justify-center gap-2">
              <AlertOctagon className="h-5 w-5" /> Duplicate Voting Detected
            </h2>
            
            <p className="text-neutral-500 mb-8">
              Our secure ledger indicates that a ballot has already been cast for this biometric identity. To maintain election integrity, each citizen is permitted only one submission.
            </p>

            <div className="space-y-3">
              <Button 
                className="w-full bg-neutral-900 hover:bg-black text-white py-6 rounded-sm font-bold uppercase tracking-wider"
                onClick={() => navigate("/")}
              >
                <Home className="mr-2 h-4 w-4" /> Return to Home
              </Button>
              <p className="text-xs text-neutral-400">
                Ref ID: {sessionStorage.getItem("userIdHash")?.slice(0, 12).toUpperCase() || "AUTH_ERR"}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </PageWrapper>
  );
}