import { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  MoreHorizontal,
  UserPlus,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { electionService } from "@/services/electionService";
import { useToast } from "@/hooks/use-toast";

// Updated Interface to match Python Backend Dictionary keys
interface Voter {
  user_id_hash: string;
  role: string;
  is_verified: number;
  phone_hash?: string;
}

export function AdminVotersView() {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVoterIds, setSelectedVoterIds] = useState<string[]>([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [elections, setElections] = useState([]);
  const [targetElectionId, setTargetElectionId] = useState("");
  const { toast } = useToast();

  // 1. Fetch users from Python Backend (Port 5001)
  const loadVoters = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:5001/api/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setVoters(res.data);
    } catch (err) {
      toast({
        title: "Fetch Error",
        description: "Could not connect to Flask Auth Service.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fetch elections for the modal dropdown
  const loadElections = async () => {
    try {
      const res = await electionService.getElections();
      setElections(res.data);
    } catch (err) {
      console.error("Failed to load elections");
    }
  };

  useEffect(() => {
    loadVoters();
    loadElections();
  }, []);

  // Filter based on User ID Hash or Phone Hash
  const filteredVoters = voters.filter(
    (voter) =>
      voter.user_id_hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.phone_hash?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleVoter = (id: string) => {
    setSelectedVoterIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const handleBulkRegister = async () => {
    if (!targetElectionId) return;
    try {
      // POST to authorize the selected hashes for a specific election
      await electionService.registerVotersForElection(
        targetElectionId,
        selectedVoterIds,
      );

      toast({
        title: "Voters Authorized",
        description: `Successfully added ${selectedVoterIds.length} voters to the election guest list.`,
      });
      setIsRegisterModalOpen(false);
      setSelectedVoterIds([]);
    } catch (error) {
      toast({ title: "Authorization Failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search by ID Hash or Phone Hash..."
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          {selectedVoterIds.length > 0 && (
            <Button
              onClick={() => setIsRegisterModalOpen(true)}
              className="bg-primary-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Authorize Selected ({selectedVoterIds.length})
            </Button>
          )}
          <Button variant="outline" onClick={loadVoters}>
            Refresh List
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-sm border border-neutral-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase font-bold text-xs tracking-wider">
                <tr>
                  <th className="p-4 w-10">
                    <Checkbox
                      checked={
                        selectedVoterIds.length === filteredVoters.length &&
                        filteredVoters.length > 0
                      }
                      onCheckedChange={(checked) => {
                        if (checked)
                          setSelectedVoterIds(
                            filteredVoters.map((v) => v.user_id_hash),
                          );
                        else setSelectedVoterIds([]);
                      }}
                    />
                  </th>
                  <th className="p-4">Voter ID Hash</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredVoters.map((voter) => (
                  <tr
                    key={voter.user_id_hash}
                    className={`hover:bg-neutral-50 transition-all ${
                      selectedVoterIds.includes(voter.user_id_hash)
                        ? "bg-primary-50/50"
                        : ""
                    }`}
                  >
                    <td className="p-4">
                      <Checkbox
                        checked={selectedVoterIds.includes(voter.user_id_hash)}
                        onCheckedChange={() => toggleVoter(voter.user_id_hash)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-neutral-200">
                          <AvatarFallback className="bg-neutral-100 text-neutral-600">
                            {voter.user_id_hash.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-mono text-xs text-neutral-700 truncate max-w-[200px]">
                          {voter.user_id_hash}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="capitalize">
                        {voter.role}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {voter.is_verified ? (
                        <div className="flex items-center text-green-600 gap-1 text-xs font-bold">
                          <CheckCircle2 size={14} /> Verified
                        </div>
                      ) : (
                        <div className="flex items-center text-amber-600 gap-1 text-xs font-bold">
                          <Clock size={14} /> Pending
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            View Hashed Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Flag for Review
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authorize for Election</DialogTitle>
            <DialogDescription>
              This will add the selected user hashes to the secure authorization
              table for the chosen election.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Target Election
            </label>
            <select
              className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white"
              value={targetElectionId}
              onChange={(e) => setTargetElectionId(e.target.value)}
            >
              <option value="">Select an election...</option>
              {elections.map((e: any) => (
                <option key={e.election_id} value={e.election_id}>
                  {e.title} ({e.status})
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRegisterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={!targetElectionId}
              onClick={handleBulkRegister}
              className="bg-primary-700 text-white"
            >
              Grant Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
