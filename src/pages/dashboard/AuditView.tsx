import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import { toast } from "sonner";
import axios from "axios";
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  RefreshCcw,
  Search,
  AlertTriangle,
} from "lucide-react";

interface AuditReport {
  summary: string;
  total_ballots_scanned: number;
  integrity_verified: number;
  tampering_detected: number;
  tampered_ballot_ids: string[];
  system_status: "SECURE" | "COMPROMISED";
}

export default function AuditView() {
  const { eid } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<AuditReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev.slice(-8), `> ${msg}`]);
  };

  const performAudit = async () => {
    setIsLoading(true);
    setLogs([]);
    addLog("Initializing HMAC integrity check...");

    try {
      const token = localStorage.getItem("token");
      addLog("Connecting to Secure Ledger...");

      const res = await axios.get(
        `/api/observer/results/${eid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.success) {
        setReport(res.data.audit_report);
        addLog(
          `Scanning ${res.data.audit_report.total_ballots_scanned} records...`,
        );

        if (res.data.audit_report.tampering_detected > 0) {
          addLog("CRITICAL: TAMPERING DETECTED");
          toast.error("Integrity Breach Found!");
        } else {
          addLog("Verification Successful: 0 mismatches.");
          toast.success("Ledger Verified Secure");
        }
      }
    } catch (error) {
      addLog("ERROR: Audit sequence interrupted.");
      toast.error("Audit Failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performAudit();
  }, [eid]);

  return (
    <PageWrapper>
      <Layout>
        <div className="p-8 max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft size={16} /> Dashboard
            </Button>
            <Button
              onClick={performAudit}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCcw
                size={16}
                className={isLoading ? "animate-spin" : ""}
              />
              Re-run Audit
            </Button>
          </div>

          <div
            className={`p-8 rounded-2xl border-2 flex flex-col items-center text-center space-y-4 shadow-sm transition-colors ${report?.system_status === "SECURE"
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"
              }`}
          >
            {report?.system_status === "SECURE" ? (
              <ShieldCheck size={64} className="text-emerald-600" />
            ) : (
              <ShieldAlert size={64} className="text-red-600" />
            )}

            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                {isLoading
                  ? "Analyzing Ledger..."
                  : `Status: ${report?.system_status}`}
              </h1>
              <p className="text-neutral-500 mt-2">
                Election ID: <span className="font-mono uppercase">{eid}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
              <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">
                Scanned
              </p>
              <p className="text-3xl font-bold">
                {report?.total_ballots_scanned || 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
              <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">
                Verified
              </p>
              <p className="text-3xl font-bold text-emerald-600">
                {report?.integrity_verified || 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
              <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">
                Tampered
              </p>
              <p className="text-3xl font-bold text-red-600">
                {report?.tampering_detected || 0}
              </p>
            </div>
          </div>

          {report && report.tampering_detected > 0 && (
            <div className="bg-red-100 border border-red-300 rounded-xl p-6">
              <div className="flex items-center gap-2 text-red-800 font-bold mb-4">
                <AlertTriangle size={20} /> Failed Integrity Signatures (Ballot
                IDs)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {report.tampered_ballot_ids.map((id) => (
                  <div
                    key={id}
                    className="bg-white p-2 rounded font-mono text-xs border border-red-200 text-red-700"
                  >
                    {id}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-neutral-900 rounded-xl p-6 text-emerald-400 font-mono text-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-emerald-900 pb-2">
              <span className="flex items-center gap-2 text-xs uppercase">
                <Search size={14} /> Forensic Log
              </span>
            </div>
            <div className="space-y-1">
              {logs.map((log, i) => (
                <p
                  key={i}
                  className={log.includes("CRITICAL") ? "text-red-400" : ""}
                >
                  {log}
                </p>
              ))}
              {isLoading && <p className="animate-pulse">_</p>}
            </div>
          </div>
        </div>
      </Layout>
    </PageWrapper>
  );
}
