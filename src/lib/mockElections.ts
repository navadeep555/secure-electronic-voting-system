export interface MockElection {
    election_id: string;
    title: string;
    status: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED";
    start_time: number;
    end_time: number;
    candidate_count: number;
    results_published: number;
    description: string;
}

const now = Math.floor(Date.now() / 1000);
const ONE_DAY = 86400;
const ONE_WEEK = ONE_DAY * 7;
const ONE_MONTH = ONE_DAY * 30;

export const mockElections: MockElection[] = [
    {
        election_id: "el-active-001",
        title: "National Delegate Selection",
        status: "ACTIVE",
        start_time: now - ONE_DAY,
        end_time: now + (ONE_DAY * 2),
        candidate_count: 5,
        results_published: 0,
        description: "Ongoing election to select state-level delegates for the upcoming constitutional convention."
    },
    {
        election_id: "el-active-002",
        title: "Municipal Bond Referendum",
        status: "ACTIVE",
        start_time: now - (ONE_DAY * 2),
        end_time: now + ONE_DAY,
        candidate_count: 2,
        results_published: 0,
        description: "Voters decide on the allocation of municipal bonds for urban infrastructure improvement."
    },
    {
        election_id: "el-future-003",
        title: "General Legislative Assembly",
        status: "DRAFT",
        start_time: now + ONE_WEEK,
        end_time: now + ONE_WEEK + (ONE_DAY * 3),
        candidate_count: 12,
        results_published: 0,
        description: "Scheduled general election for the primary legislative assembly seats."
    },
    {
        election_id: "el-future-004",
        title: "Special Mayoral Ballot",
        status: "DRAFT",
        start_time: now + ONE_MONTH,
        end_time: now + ONE_MONTH + ONE_DAY,
        candidate_count: 4,
        results_published: 0,
        description: "Special election ballot for the vacant mayoral position in District 4."
    },
    {
        election_id: "el-closed-005",
        title: "Educational Board Election",
        status: "CLOSED",
        start_time: now - ONE_MONTH - (ONE_DAY * 3),
        end_time: now - ONE_MONTH,
        candidate_count: 8,
        results_published: 1,
        description: "Past election for the unified school district educational board members."
    },
    {
        election_id: "el-closed-006",
        title: "Healthcare Initiative Prop 10",
        status: "CLOSED",
        start_time: now - (ONE_MONTH * 3),
        end_time: now - (ONE_MONTH * 3) + ONE_DAY,
        candidate_count: 2,
        results_published: 1,
        description: "Voter proposition regarding community healthcare resource allocation."
    }
];
