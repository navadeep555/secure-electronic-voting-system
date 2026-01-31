import { useState } from "react";
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
  Filter
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Mock Data
const INITIAL_ELECTIONS = [
  { 
    id: "1", 
    title: "2024 Presidential Election", 
    type: "Federal", 
    status: "active", 
    startDate: "2024-11-01", 
    endDate: "2024-11-05", 
    candidates: 4,
    voters: 2400000 
  },
  { 
    id: "2", 
    title: "State Senate Election", 
    type: "State", 
    status: "active", 
    startDate: "2024-11-01", 
    endDate: "2024-11-05", 
    candidates: 6,
    voters: 1800000 
  },
  { 
    id: "3", 
    title: "Local School Board", 
    type: "Local", 
    status: "upcoming", 
    startDate: "2024-12-15", 
    endDate: "2024-12-16", 
    candidates: 8,
    voters: 50000 
  },
];

export function AdminElectionsView() {
  const [elections, setElections] = useState(INITIAL_ELECTIONS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // New Election Form State
  const [newElection, setNewElection] = useState({
    title: "",
    type: "Federal",
    startDate: "",
    endDate: ""
  });

  const handleCreateElection = () => {
    const election = {
      id: Math.random().toString(36).substr(2, 9),
      ...newElection,
      status: "upcoming",
      candidates: 0,
      voters: 0
    };
    setElections([...elections, election as any]);
    setIsCreateOpen(false);
    setNewElection({ title: "", type: "Federal", startDate: "", endDate: "" });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "upcoming": return "bg-blue-100 text-blue-800 border-blue-200";
      case "ended": return "bg-neutral-100 text-neutral-800 border-neutral-200";
      case "paused": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-neutral-100 text-neutral-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input 
              placeholder="Search elections..." 
              className="pl-10 bg-white"
            />
          </div>
          <Button variant="outline" className="bg-white">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-primary-700 hover:bg-primary-800 text-white">
          <Plus className="h-4 w-4 mr-2" /> Create Election
        </Button>
      </div>

      {/* Election Grid */}
      <div className="grid grid-cols-1 gap-4">
        {elections.map((election) => (
          <div 
            key={election.id} 
            className="group bg-white rounded-sm border border-neutral-200 p-5 shadow-sm hover:border-primary-300 transition-all hover:shadow-md flex flex-col md:flex-row gap-6 items-start md:items-center"
          >
            {/* Date Block */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-neutral-50 rounded-sm border border-neutral-200">
              <span className="text-xs font-bold text-neutral-400 uppercase">{election.startDate.split('-')[1]}</span>
              <span className="text-xl font-bold text-neutral-900">{election.startDate.split('-')[2]}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={`${getStatusColor(election.status)} rounded-sm px-2 py-0.5 border`}>
                  {election.status}
                </Badge>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{election.type}</span>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 truncate">{election.title}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> 
                  {election.endDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> 
                  {election.candidates} Candidates
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end md:self-center">
               <Button variant="secondary" size="sm" className="hidden md:flex">
                 Manage Candidates
               </Button>
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-8 w-8">
                     <MoreVertical className="h-4 w-4" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end">
                   <DropdownMenuItem>
                     <FileEdit className="h-4 w-4 mr-2" /> Edit Details
                   </DropdownMenuItem>
                   {election.status === 'active' ? (
                     <DropdownMenuItem className="text-orange-600">
                       <Pause className="h-4 w-4 mr-2" /> Pause Election
                     </DropdownMenuItem>
                   ) : (
                     <DropdownMenuItem className="text-green-600">
                       <Play className="h-4 w-4 mr-2" /> Activate Election
                     </DropdownMenuItem>
                   )}
                   <DropdownMenuItem className="text-red-600">
                     <Trash2 className="h-4 w-4 mr-2" /> Delete
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Create Election Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Election</DialogTitle>
            <DialogDescription>
              Set up a new ballot. You can add candidates after creating the election.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Election Title</Label>
              <Input 
                id="title" 
                value={newElection.title} 
                onChange={(e) => setNewElection({...newElection, title: e.target.value})}
                placeholder="e.g., 2024 General Election" 
              />
            </div>
            <div className="grid gap-2">
              <Label>Election Type</Label>
              <RadioGroup 
                defaultValue="Federal" 
                value={newElection.type}
                onValueChange={(val) => setNewElection({...newElection, type: val})}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Federal" id="fed" />
                  <Label htmlFor="fed">Federal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="State" id="state" />
                  <Label htmlFor="state">State</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Local" id="local" />
                  <Label htmlFor="local">Local</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start">Start Date</Label>
                <Input 
                  id="start" 
                  type="date"
                  value={newElection.startDate}
                  onChange={(e) => setNewElection({...newElection, startDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end">End Date</Label>
                <Input 
                  id="end" 
                  type="date" 
                  value={newElection.endDate}
                  onChange={(e) => setNewElection({...newElection, endDate: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateElection} className="bg-primary-700 text-white">Create Election</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
