import api from '../../services/api.js';

const complaintService = {
  createComplaint: async (data, image) => {
    if (!image) return await api.post('/complaints', data);
    const body = new FormData();
    Object.entries(data).forEach(([key, value]) => body.append(key, value));
    body.append('image', image);
    return await api.post('/complaints', body);
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
