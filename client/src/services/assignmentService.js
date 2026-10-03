import api from './api.js';

const assignmentService = {
  assignTechnician: async (complaintId, technicianId) => {
    return await api.post(`/complaints/${complaintId}/assign`, { technicianId });
  },
  
  getAssignment: async (complaintId) => {
    return await api.get(`/complaints/${complaintId}/assignment`);
  },

  getMyAssignments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/assignments/my${query ? `?${query}` : ''}`);
  },
  
  acceptAssignment: async (assignmentId) => {
    return await api.patch(`/assignments/${assignmentId}/accept`);
  },
  
  startWork: async (assignmentId) => {
    return await api.patch(`/assignments/${assignmentId}/start`);
  },

  resolveComplaint: async (assignmentId, resolutionNotes) => {
    return await api.patch(`/assignments/${assignmentId}/resolve`, { resolutionNotes });
  },

  reassignTechnician: async (assignmentId, technicianId) => {
    return await api.patch(`/assignments/${assignmentId}/reassign`, { technicianId });
  },

  closeComplaint: async (complaintId) => {
    return await api.patch(`/complaints/${complaintId}/close`);
  }
};

export default assignmentService;
