import { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  Clock,
  MoreVertical,
  Play,
  Pause,
  FileEdit,
  Trash2,
  Users,
  Search,
  Filter,
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

export function AdminElectionsView() {
  const [elections, setElections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // US3.3: Candidate Management States
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [candidateForm, setCandidateForm] = useState({ name: "", party: "" });
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);

  const { toast } = useToast();

  const [newElection, setNewElection] = useState({
    title: "",
    type: "Federal",
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
        description: "Failed to load elections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateElection = async () => {
    try {
      if (
        !newElection.title ||
        !newElection.startDate ||
        !newElection.endDate
      ) {
        toast({ title: "Required", description: "Please fill in all fields" });
        return;
      }
      await electionService.createElection({
        title: newElection.title,
        description: newElection.description || "No description provided",
        startDate: newElection.startDate,
        endDate: newElection.endDate,
        candidates: [],
      });
      toast({ title: "Success", description: "Election created successfully" });
      setIsCreateOpen(false);
      setNewElection({
        title: "",
        type: "Federal",
        startDate: "",
        endDate: "",
        description: "",
      });
      fetchElections();
    } catch (error: any) {
      toast({ title: "Creation Failed", variant: "destructive" });
    }
  };

  // US3.6: Handle Status Toggle with "Point of No Return" Warning
  const handleStatusChange = async (id: string, currentStatus: string) => {
    let nextStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";

    // US3.6: Intercept Draft -> Active transition
    if (currentStatus === "DRAFT") {
      const confirmed = window.confirm(
        "Warning: Once activated, the candidate list will be cryptographically locked and cannot be edited. Are you sure you want to proceed?",
      );
      if (!confirmed) return;
    }

    try {
      await electionService.updateStatus(id, nextStatus);
      toast({ title: `Election is now ${nextStatus}` });
      fetchElections();
    } catch (error) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  // US3.3: Add Candidate logic
  const handleAddCandidate = async () => {
    if (!candidateForm.name || !candidateForm.party) return;
    setIsAddingCandidate(true);
    try {
      // Ensure you added addCandidate to electionService.ts as discussed
      await electionService.addCandidate(
        selectedElection.election_id,
        candidateForm.name,
        candidateForm.party,
      );
      toast({
        title: "Candidate Added",
        description: `${candidateForm.name} is now on the ballot.`,
      });
      setCandidateForm({ name: "", party: "" });
      fetchElections(); // Refresh counts
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

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "DRAFT":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CLOSED":
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
      case "PAUSED":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-neutral-100 text-neutral-800";
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
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search elections..."
              className="pl-10 bg-white"
            />
          </div>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary-700 hover:bg-primary-800 text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Election
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {elections.map((election: any) => {
          const sDate = formatDate(election.start_time);
          const eDate = formatDate(election.end_time);

          return (
            <div
              key={election.election_id}
              className="group bg-white rounded-sm border border-neutral-200 p-5 shadow-sm hover:border-primary-300 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center"
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
                    className={`${getStatusColor(election.status)} rounded-sm px-2 py-0.5 border uppercase text-[10px]`}
                  >
                    {election.status}
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

              <div className="flex items-center gap-2 self-end md:self-center">
                {/* US3.3 Button Trigger */}
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
                      <FileEdit className="h-4 w-4 mr-2" /> Edit Details
                    </DropdownMenuItem>

                    {election.status === "ACTIVE" ? (
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(election.election_id, "ACTIVE")
                        }
                        className="text-orange-600 font-medium"
                      >
                        <Pause className="h-4 w-4 mr-2" /> Pause Election
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(
                            election.election_id,
                            election.status,
                          )
                        }
                        className="text-green-600 font-medium"
                        disabled={election.status === "CLOSED"}
                      >
                        <Play className="h-4 w-4 mr-2" />{" "}
                        {election.status === "DRAFT"
                          ? "Activate Election"
                          : "Resume Election"}
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      className="text-red-600"
                      disabled={election.status === "ACTIVE"}
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

      {/* US3.3: Manage Candidates Modal */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Candidates</DialogTitle>
            <DialogDescription>
              Add candidates to <strong>{selectedElection?.title}</strong>.
              Note: Candidates cannot be added after the election is activated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="c-name">Candidate Full Name</Label>
              <Input
                id="c-name"
                value={candidateForm.name}
                onChange={(e) =>
                  setCandidateForm({ ...candidateForm, name: e.target.value })
                }
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-party">Party Affiliation</Label>
              <Input
                id="c-party"
                value={candidateForm.party}
                onChange={(e) =>
                  setCandidateForm({ ...candidateForm, party: e.target.value })
                }
                placeholder="e.g. Independent"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManageOpen(false)}>
              Close
            </Button>
            <Button
              className="bg-primary-700 text-white"
              onClick={handleAddCandidate}
              disabled={
                isAddingCandidate || !candidateForm.name || !candidateForm.party
              }
            >
              {isAddingCandidate ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add to Ballot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* US3.1: Create Election Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Election</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Election Title</Label>
              <Input
                id="title"
                value={newElection.title}
                onChange={(e) =>
                  setNewElection({ ...newElection, title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Input
                id="desc"
                value={newElection.description}
                onChange={(e) =>
                  setNewElection({
                    ...newElection,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start">Start Date</Label>
                <Input
                  id="start"
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
                <Label htmlFor="end">End Date</Label>
                <Input
                  id="end"
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
              className="bg-primary-700 text-white"
            >
              Initialize Election
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
