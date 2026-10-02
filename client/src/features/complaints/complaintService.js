import api from '../../services/api.js';

const complaintService = {
  createComplaint: async (data) => {
    return await api.post('/complaints', data);
  },
  
  getComplaints: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/complaints${query ? `?${query}` : ''}`);
  },
  
  getComplaint: async (id) => {
    return await api.get(`/complaints/${id}`);
  },
  
  getComplaintHistory: async (id) => {
    return await api.get(`/complaints/${id}/history`);
  }
};

export default complaintService;
