import AIAnalysis from '../models/AIAnalysis.js';
import Complaint from '../models/Complaint.js';
import Assignment from '../models/Assignment.js';
import { analyzeComplaint } from '../services/ai/aiService.js';

export const getAnalysis = async (req, res) => {
  try {
    const { complaintId } = req.params;
    
    // Check authorization
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });

    // Students can only view their own
    if (req.user.role === 'student' && complaint.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this analysis.' });
    }

    if (req.user.role === 'technician') {
      const isAssigned = await Assignment.findOne({
        complaintId,
        technicianId: req.user._id,
        status: { $ne: 'cancelled' }
      });
      if (!isAssigned) {
         return res.status(403).json({ success: false, message: 'Not assigned to this complaint.' });
      }
    }

    let analysis = await AIAnalysis.findOne({ complaintId }).populate('matchedComplaints.complaintId', 'title status complaintNumber');
    
    if (!analysis) {
      analysis = await analyzeComplaint(complaintId);
      analysis = await AIAnalysis.findOne({ complaintId }).populate('matchedComplaints.complaintId', 'title status complaintNumber');
    }

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const triggerAnalysis = async (req, res) => {
  try {
    const { complaintId } = req.params;
    
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });

    if (req.user.role === 'student' && complaint.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (req.user.role === 'technician') {
      const isAssigned = await Assignment.findOne({ complaintId, technicianId: req.user._id, status: { $ne: 'cancelled' } });
      if (!isAssigned) return res.status(403).json({ success: false, message: 'Not assigned.' });
    }

    const analysis = await analyzeComplaint(complaintId);
    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
