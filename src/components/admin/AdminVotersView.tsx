import { useState } from "react";
import {
    Search,
    Filter,
    MoreHorizontal,
    Shield,
    ShieldAlert,
    CheckCircle2,
    XCircle,
    FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock Data
const MOCK_VOTERS = [
    {
        id: "VOT-2024-001",
        name: "Alice Johnson",
        email: "alice@example.com",
        constituency: "District 9",
        status: "verified",
        registrationDate: "2023-05-12",
        hasVoted: true
    },
    {
        id: "VOT-2024-002",
        name: "Bob Smith",
        email: "bob.smith@example.com",
        constituency: "District 4",
        status: "pending",
        registrationDate: "2024-01-20",
        hasVoted: false
    },
    {
        id: "VOT-2024-003",
        name: "Carol White",
        email: "carol.w@example.com",
        constituency: "District 9",
        status: "verified",
        registrationDate: "2022-11-05",
        hasVoted: true
    },
    {
        id: "VOT-2024-004",
        name: "Dave Brown",
        email: "dave.b@example.com",
        constituency: "District 2",
        status: "rejected",
        registrationDate: "2024-02-15",
        hasVoted: false
    },
    {
        id: "VOT-2024-005",
        name: "Eve Davis",
        email: "eve.d@example.com",
        constituency: "District 7",
        status: "verified",
        registrationDate: "2023-08-30",
        hasVoted: false
    },
];

export function AdminVotersView() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredVoters = MOCK_VOTERS.filter(voter =>
        voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-2 flex-1 max-w-lg">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                            placeholder="Search by name, email, or ID..."
                            className="pl-10 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="bg-white">
                        <Filter className="h-4 w-4 mr-2" /> Filter
                    </Button>
                </div>
                <Button variant="outline" className="border-primary-200 text-primary-700 bg-primary-50">
                    <FileCheck className="h-4 w-4 mr-2" /> Export List
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-sm border border-neutral-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase font-bold text-xs tracking-wider">
                            <tr>
                                <th className="p-4 pl-6">Voter Details</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Constituency</th>
                                <th className="p-4">Participation</th>
                                <th className="p-4 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filteredVoters.map((voter) => (
                                <tr key={voter.id} className="hover:bg-neutral-50 transition-all group">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-neutral-200">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${voter.name}`} />
                                                <AvatarFallback>{voter.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-bold text-neutral-900">{voter.name}</div>
                                                <div className="text-xs text-neutral-500 font-mono">{voter.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {voter.status === 'verified' && (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                                                <Shield className="h-3 w-3" /> Verified
                                            </Badge>
                                        )}
                                        {voter.status === 'pending' && (
                                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1">
                                                <ShieldAlert className="h-3 w-3" /> Pending
                                            </Badge>
                                        )}
                                        {voter.status === 'rejected' && (
                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
                                                <XCircle className="h-3 w-3" /> Rejected
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="p-4 text-neutral-600 font-medium">
                                        {voter.constituency}
                                    </td>
                                    <td className="p-4">
                                        {voter.hasVoted ? (
                                            <div className="flex items-center gap-1.5 text-green-700 font-bold text-xs uppercase">
                                                <CheckCircle2 className="h-4 w-4" /> Voted
                                            </div>
                                        ) : (
                                            <span className="text-neutral-400 text-xs uppercase font-bold">Has not voted</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-neutral-700">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Voter Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                <DropdownMenuItem>View History</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {voter.status === 'pending' && (
                                                    <DropdownMenuItem className="text-green-600 font-bold">Approve Identity</DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem className="text-red-600">Flag Suspicious</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredVoters.length === 0 && (
                        <div className="p-12 text-center text-neutral-500">
                            <p>No voters found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
