import axios from "axios";

const API_BASE = "http://localhost:5001/api/voter";

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("voterToken")}`,
  },
});

export const voterElectionService = {
  getActiveElections: () =>
    axios.get(`${API_BASE}/elections`, getAuthHeader()),

  getCandidates: (electionId: string) =>
    axios.get(
      `${API_BASE}/elections/${electionId}/candidates`,
      getAuthHeader()
    ),
};

