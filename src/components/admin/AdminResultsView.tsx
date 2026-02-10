import { useState } from "react";
import { electionService } from "@/services/electionService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Lock, Unlock, BarChart3 } from "lucide-react";

export function AdminResultsView({
  electionId,
  title,
}: {
  electionId: string;
  title: string;
}) {
  const [decryptionKey, setDecryptionKey] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const [isDecrypted, setIsDecrypted] = useState(false);

  const handleFetchResults = async () => {
    try {
      const res = await electionService.getTally(electionId, decryptionKey);
      setResults(res.data.results);
      setIsDecrypted(true);
    } catch (error) {
      alert("Invalid Decryption Key or Election not closed.");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-dashed border-2">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {isDecrypted ? (
            <Unlock className="text-green-600" />
          ) : (
            <Lock className="text-amber-600" />
          )}
          Results: {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isDecrypted ? (
          <div className="space-y-4">
            <p className="text-sm text-neutral-500 text-center">
              Enter the Master Decryption Key to finalize the tally and generate
              the report.
            </p>
            <Input
              type="password"
              placeholder="Master Key"
              value={decryptionKey}
              onChange={(e) => setDecryptionKey(e.target.value)}
            />
            <Button className="w-full" onClick={handleFetchResults}>
              Finalize Tally
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {results?.map((r) => (
              <div key={r.candidate_name} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>
                    {r.candidate_name} ({r.party})
                  </span>
                  <span>{r.vote_count} votes</span>
                </div>
                <div className="w-full bg-neutral-100 h-4 rounded-full overflow-hidden">
                  <div
                    className="bg-primary-600 h-full transition-all"
                    style={{
                      width: `${(r.vote_count / results.reduce((a, b) => a + b.vote_count, 0)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.print()}
            >
              Export Audit Report (PDF)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
