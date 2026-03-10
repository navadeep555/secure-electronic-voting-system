import axios from 'axios';

// Ensure the port matches your Flask's running port (5000 or 5001)
const API_BASE = "/api/admin";

// Helper to get the token for protected admin routes
const getAuthHeader = () => ({
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    }
});

export const electionService = {
    /**
     * Fetch all public elections (no auth required)
     */
    getPublicElections: () => axios.get(`/api/public/elections`),

    /**
     * Fetch all elections for the dashboard list
     */
    getElections: () => axios.get(`/api/elections`, getAuthHeader()),

    /**
     * Create a new election.
     * Note: We pass the payload directly because the View already 
     * formatted start_time and end_time as Unix integers.
     */
    createElection: (payload: any) => {
        return axios.post(`${API_BASE}/setup-election`, payload, getAuthHeader());
    },

    /**
     * Add a candidate to a specific election
     */
    addCandidate: (electionId: string, name: string, party: string) => {
        return axios.post(
            `${API_BASE}/add-candidate`,
            { electionId, name, party },
            getAuthHeader()
        );
    },

    /**
     * Change election status (DRAFT -> ACTIVE -> PAUSED -> CLOSED)
     */
    updateStatus: (electionId: string, status: string) =>
        axios.patch(`${API_BASE}/election-status`, { electionId, status }, getAuthHeader()),

    /**
     * Get the final results for an election
     */
    getTally: (electionId: string, decryptionKey: string) =>
        axios.get(`${API_BASE}/tally/${electionId}?decryptionKey=${decryptionKey}`, getAuthHeader()),

    /**
     * Bulk register voter hashes for an election (US3.4)
     */
    registerVotersForElection: (electionId: string, voterHashes: string[]) =>
        axios.post(`${API_BASE}/register-voters`, { electionId, voterHashes }, getAuthHeader()),

    /**
     * Delete an election (Draft mode only)
     */
    deleteElection: (electionId: string) =>
        axios.delete(`${API_BASE}/elections/${electionId}`, getAuthHeader())
};