import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Download,
  Lock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import axios from "axios";

const PublicResults = () => {
  const { eid } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // We fetch from the same observer endpoint, but the backend 
    // logic should now return a 403 or a specific status if results_published is 0
    fetch(`/api/observer/results/${eid}`)
      .then((res) => {
        if (res.status === 404) throw new Error("Not Found");
        return res.json();
      })
      .then((json) => setData(json))
      .catch(() => setError(true));
  }, [eid]);

  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `/api/admin/election/${eid}/report`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const reportData = response.data;
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.setTextColor(128, 0, 32);
      doc.text("Official Election Audit Report", 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Election ID: ${reportData.report_metadata.election_id}`, 14, 30);
      doc.text(`Generated On: ${new Date(reportData.report_metadata.generated_at).toLocaleString()}`, 14, 35);
      doc.line(14, 40, 196, 40);

      const tableRows = reportData.election_summary.candidate_breakdown.map(
        (c: any) => [c.candidate_name, c.votes.toString()]
      );

      autoTable(doc, {
        startY: 55,
        head: [["Candidate Name", "Total Votes"]],
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [128, 0, 32] },
      });

      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Cryptographic Integrity Audit", 14, finalY);

      doc.setFontSize(10);
      doc.text(`Audit Status: ${reportData.audit_verification.integrity_check}`, 14, finalY + 7);

      const isAuditSuccess = reportData.audit_verification.integrity_check === "SUCCESS";
      doc.setDrawColor(isAuditSuccess ? 0 : 200, isAuditSuccess ? 128 : 0, 0);
      doc.rect(14, finalY + 12, 182, 20);
      doc.text(isAuditSuccess ? "CERTIFIED: Verified against HMAC ledger." : "CAUTION: Audit failed.", 20, finalY + 22);

      doc.save(`Audit_Report_${eid}.pdf`);
      toast.success("Audit report generated");
    } catch (err) {
      toast.error("Download failed. Admin permissions required.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (error) return <div className="p-10 text-center text-red-500 font-bold">Election record not found.</div>;
  if (!data) return <div className="h-screen flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin h-8 w-8 text-neutral-400" /><p>Syncing Ledger...</p></div>;

  // --- NEW: Handle Un-published Results (US 4.5) ---
  if (data.results_published === 0 && data.status !== "VOTING_IN_PROGRESS") {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl border border-amber-100 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Results Pending</h2>
        <p className="text-neutral-500 mb-6">The election has ended, but the team is currently performing the final cryptographic audit before public release.</p>
        <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
      </div>
    );
  }

  // --- Handle Masked Results during Live Voting ---
  if (data.status === "VOTING_IN_PROGRESS") {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl border border-blue-100 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Voting Live</h2>
        <p className="text-neutral-500 mb-6">To ensure fairness, results remain masked until polls close and integrity is verified.</p>
        <div className="p-3 bg-neutral-50 rounded-lg font-mono text-sm border border-neutral-100">
          Cast Ballots: <span className="font-bold text-blue-600">{data.total_cast}</span>
        </div>
        <Button variant="ghost" className="mt-6" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
      </div>
    );
  }

  const chartData = Object.keys(data.results || {}).map((name) => ({
    name,
    votes: data.results[name],
  }));
  const isSecure = data.audit_report?.status === "SECURE";

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Dashboard
        </Button>
        <Button
          className="bg-[#800020] hover:bg-[#600018]"
          onClick={handleDownloadReport}
          disabled={isDownloading}
        >
          {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Official PDF Report
        </Button>
      </div>

      <div className={`p-5 rounded-xl mb-8 flex items-center gap-4 shadow-sm border border-l-8 ${isSecure ? "bg-green-50 border-green-200 border-l-green-600" : "bg-red-50 border-red-200 border-l-red-600"}`}>
        {isSecure ? <ShieldCheck className="h-10 w-10 text-green-600" /> : <ShieldAlert className="h-10 w-10 text-red-600" />}
        <div>
          <h3 className={`font-bold text-lg ${isSecure ? "text-green-800" : "text-red-800"}`}>
            {isSecure ? "CRYPTOGRAPHICALLY VERIFIED" : "INTEGRITY BREACH DETECTED"}
          </h3>
          <p className="text-sm opacity-80">This tally matches the secure immutable ledger.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
        <h2 className="text-lg font-bold mb-6 text-neutral-800">Verified Results</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "#f8f9fa" }} contentStyle={{ borderRadius: "8px", border: "none" }} />
              <Bar dataKey="votes" radius={[6, 6, 0, 0]} barSize={50}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={isSecure ? "#800020" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PublicResults;