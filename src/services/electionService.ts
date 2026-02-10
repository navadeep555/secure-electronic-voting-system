import axios from 'axios';

const API_BASE = "http://localhost:5001/api/admin";

const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const electionService = {
    getElections: () => axios.get(`${API_BASE}/elections`, getAuthHeader()),

    createElection: (data: any) => {
        const payload = {
            ...data,
            start_time: Math.floor(new Date(data.startDate).getTime() / 1000),
            end_time: Math.floor(new Date(data.endDate).getTime() / 1000),
        };
        return axios.post(`${API_BASE}/setup-election`, payload, getAuthHeader());
    },

    // Add this to your electionService object
addCandidate: (electionId: string, name: string, party: string) => {
    return axios.post(
        `${API_BASE}/add-candidate`, 
        { electionId, name, party }, 
        getAuthHeader()
    );
},

    updateStatus: (electionId: string, status: string) => 
        axios.patch(`${API_BASE}/election-status`, { electionId, status }, getAuthHeader()),

    getTally: (electionId: string, decryptionKey: string) => 
        axios.get(`${API_BASE}/tally/${electionId}?decryptionKey=${decryptionKey}`, getAuthHeader()),

    // --- ADD THIS NEW METHOD FOR US3.4 ---
    registerVotersForElection: (electionId: string, voterHashes: string[]) => 
        axios.post(`${API_BASE}/register-voters`, { electionId, voterHashes }, getAuthHeader())
};