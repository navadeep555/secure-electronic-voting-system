import { useState, useEffect } from "react";
import {
  Plus,
  Clock,
  MoreVertical,
  Play,
  Pause,
  FileEdit,
  Trash2,
  Users,
  Search,
  Loader2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { electionService } from "@/services/electionService";

// --- 1. Define the Interface to match your app.py Schema ---
interface Election {
  election_id: string;
  title: string;
  description: string;
  start_time: number;
  end_time: number;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED";
  candidate_count?: number;
}

export function AdminElectionsView() {
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Candidate Management States
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null,
  );
  const [candidateForm, setCandidateForm] = useState({ name: "", party: "" });
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);

  const { toast } = useToast();

  const [newElection, setNewElection] = useState({
    title: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setIsLoading(true);
      const res = await electionService.getElections();
      setElections(res.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load elections from the server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateElection = async () => {
    try {
      // 1. Basic Validation
      if (
        !newElection.title ||
        !newElection.startDate ||
        !newElection.endDate
      ) {
        toast({ title: "Required", description: "Please fill in all fields" });
        return;
      }

      // 2. Convert "2026-02-21" string to Unix Integer
      const startDateObj = new Date(newElection.startDate);
      // Start of the day
      startDateObj.setHours(0, 0, 0, 0);
      const startUnix = Math.floor(startDateObj.getTime() / 1000);

      const endDateObj = new Date(newElection.endDate);
      // End of the selected day
      endDateObj.setHours(23, 59, 59, 999);
      const endUnix = Math.floor(endDateObj.getTime() / 1000);

      // 3. Prevent sending 'None' to Flask
      if (isNaN(startUnix) || isNaN(endUnix)) {
        toast({
          title: "Invalid Dates",
          description: "Please re-select the dates using the calendar.",
          variant: "destructive",
        });
        return;
      }

      // 3b. Prevent creating elections in the past
      const todayUnix = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
      if (startUnix < todayUnix) {
        toast({
          title: "Invalid Start Date",
          description: "Start Date cannot be in the past.",
          variant: "destructive",
        });
        return;
      }

      // 4. Construct the exact payload expected by the backend
      const payload = {
        title: newElection.title,
        description: newElection.description || "No description provided",
        start_time: startUnix,
        end_time: endUnix,
        candidates: [],
      };

      console.log("🚀 Payload being sent to Flask:", payload);

      await electionService.createElection(payload);

      toast({ title: "Success", description: "Election initialized!" });
      setIsCreateOpen(false);
      setNewElection({
        title: "",
        startDate: "",
        endDate: "",
        description: "",
      });
      fetchElections();
    } catch (error: any) {
      console.error("API Error:", error);
      toast({
        title: "Creation Failed",
        description: "Check terminal logs.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    let nextStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";

    if (currentStatus === "DRAFT") {
      const confirmed = window.confirm(
        "Warning: Once activated, the candidate list will be cryptographically locked. Proceed?",
      );
      if (!confirmed) return;
    }

    try {
      await electionService.updateStatus(id, nextStatus);
      toast({ title: `Election status updated to ${nextStatus}` });
      fetchElections();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this election?");
    if (!confirmed) return;

    try {
      await electionService.deleteElection(id);
      toast({ title: "Election Deleted" });
      fetchElections();
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.response?.data?.message || "Could not delete election.",
        variant: "destructive"
      });
    }
  };

  const handleAddCandidate = async () => {
    if (!candidateForm.name || !candidateForm.party || !selectedElection)
      return;
    setIsAddingCandidate(true);
    try {
      await electionService.addCandidate(
        selectedElection.election_id,
        candidateForm.name,
        candidateForm.party,
      );
      toast({
        title: "Candidate Added",
        description: `${candidateForm.name} is on the ballot.`,
      });
      setCandidateForm({ name: "", party: "" });
      fetchElections();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add candidate.",
        variant: "destructive",
      });
    } finally {
      setIsAddingCandidate(false);
    }
  };

  const formatDate = (unix: number) => {
    if (!unix) return "N/A";
    return new Date(unix * 1000).toISOString().split("T")[0];
  };

  const getStatusDisplay = (status: string, endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    // An election is closed if its status is literally "CLOSED", 
    // or if it has a valid end time in the past and isn't a draft.
    const isCompleted = (endTime > 0 && now > endTime && status !== "DRAFT") || status === "CLOSED";

    if (isCompleted)
      return {
        label: "CLOSED",
        color: "bg-neutral-100 text-neutral-800 border-neutral-200",
      };

    switch (status.toUpperCase()) {
      case "ACTIVE":
        return {
          label: "ACTIVE",
          color: "bg-green-100 text-green-800 border-green-200",
        };
      case "DRAFT":
        return {
          label: "DRAFT",
          color: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "PAUSED":
        return {
          label: "PAUSED",
          color: "bg-orange-100 text-orange-800 border-orange-200",
        };
      default:
        return { label: status, color: "bg-neutral-100 text-neutral-800" };
    }
  };

  if (isLoading)
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-4 text-neutral-500">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Synchronizing with Secure Ledger...</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input placeholder="Search elections..." className="pl-10 bg-white" />
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#800020] hover:bg-[#600015] text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Election
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {elections.map((election) => {
          const sDate = formatDate(election.start_time);
          const eDate = formatDate(election.end_time);
          const statusInfo = getStatusDisplay(
            election.status,
            election.end_time,
          );

          return (
            <div
              key={election.election_id}
              className="bg-white rounded-sm border border-neutral-200 p-5 shadow-sm hover:border-red-200 transition-all flex flex-col md:flex-row gap-6 items-center"
            >
              <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-neutral-50 rounded-sm border border-neutral-200 font-mono">
                <span className="text-xs font-bold text-neutral-400 uppercase">
                  {sDate.split("-")[1]}
                </span>
                <span className="text-xl font-bold text-neutral-900">
                  {sDate.split("-")[2]}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="outline"
                    className={`${statusInfo.color} rounded-sm px-2 py-0.5 border uppercase text-[10px]`}
                  >
                    {statusInfo.label}
                  </Badge>
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    ID: {election.election_id.substring(0, 8)}...
                  </span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 truncate">
                  {election.title}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Closes: {eDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />{" "}
                    {election.candidate_count || 0} Candidates
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedElection(election);
                    setIsManageOpen(true);
                  }}
                  disabled={election.status !== "DRAFT"}
                >
                  Manage Candidates
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled={election.status !== "DRAFT"}>
                      <FileEdit className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleStatusChange(
                          election.election_id,
                          election.status,
                        )
                      }
                    >
                      {election.status === "ACTIVE" ? (
                        <Pause className="h-4 w-4 mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {election.status === "ACTIVE" ? "Pause" : "Activate"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      disabled={election.status === "ACTIVE"}
                      onClick={() => handleDelete(election.election_id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MODALS --- */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Candidates</DialogTitle>
            <DialogDescription>
              Add candidates to the secure ballot.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input
                value={candidateForm.name}
                onChange={(e) =>
                  setCandidateForm({ ...candidateForm, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Party Affiliation</Label>
              <Input
                value={candidateForm.party}
                onChange={(e) =>
                  setCandidateForm({ ...candidateForm, party: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManageOpen(false)}>
              Close
            </Button>
            <Button
              className="bg-[#800020] text-white"
              onClick={handleAddCandidate}
              disabled={isAddingCandidate}
            >
              {isAddingCandidate ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}{" "}
              Add to Ballot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Election</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                value={newElection.title}
                onChange={(e) =>
                  setNewElection({ ...newElection, title: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newElection.startDate}
                  onChange={(e) =>
                    setNewElection({
                      ...newElection,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newElection.endDate}
                  onChange={(e) =>
                    setNewElection({ ...newElection, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateElection}
              className="bg-[#800020] text-white"
            >
              Initialize Election
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
