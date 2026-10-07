import Assignment from '../models/Assignment.js';
import Complaint from '../models/Complaint.js';
import ComplaintHistory from '../models/ComplaintHistory.js';
import User from '../models/User.js';
import { createNotification } from '../services/notification/notificationService.js';

export const assignTechnician = async (req, res) => {
  try {
    const { id: complaintId } = req.params;
    const { technicianId } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) throw new Error('Complaint not found.');
    if (complaint.status === 'closed') throw new Error('Cannot assign a closed complaint.');

    const technician = await User.findOne({ _id: technicianId, role: 'technician', isActive: true });
    if (!technician) throw new Error('Invalid or inactive technician.');

    const existingActive = await Assignment.findOne({ 
      complaintId, 
      status: { $in: ['assigned', 'accepted', 'in_progress'] } 
    });
    if (existingActive) throw new Error('Complaint already has an active assignment.');

    const assignment = await Assignment.create({
      complaintId,
      technicianId,
      assignedBy: req.user._id,
      status: 'assigned',
      assignedAt: new Date()
    });

    complaint.status = 'assigned';
    await complaint.save();

    await ComplaintHistory.create({
      complaintId,
      actorId: req.user._id,
      action: 'assigned',
      fromStatus: 'pending',
      toStatus: 'assigned',
      comment: `Assigned to technician ${technician.name}`
    });

    createNotification({
      recipientId: technicianId,
      type: 'complaint_assigned',
      title: 'New Complaint Assigned',
      message: `You have been assigned to complaint ${complaint.complaintNumber}.`,
      complaintId: complaint._id,
      assignmentId: assignment._id
    }).catch(err => console.error(err));

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(error.message.includes('not found') ? 404 : 400).json({ success: false, message: error.message });
  }
};

export const getAssignment = async (req, res) => {
  try {
    const { id: complaintId } = req.params;
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });

    if (req.user.role === 'student' && complaint.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const assignments = await Assignment.find({ complaintId, ...(req.user.role === 'technician' ? { technicianId: req.user._id, status: { $ne: 'cancelled' } } : {}) })
      .populate('technicianId', 'name email')
      .populate('assignedBy', 'name role')
      .sort({ createdAt: -1 });

    if (req.user.role === 'technician') {
      const isAssigned = assignments.some(a => a.technicianId._id.toString() === req.user._id.toString());
      if (!isAssigned) return res.status(403).json({ success: false, message: 'Not authorized to view this assignment.' });
    }

    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { technicianId: req.user._id };
    if (status) query.status = status;

    const limitNum = Math.min(Math.max(parseInt(limit), 1), 100);
    const skip = (Math.max(parseInt(page), 1) - 1) * limitNum;

    const total = await Assignment.countDocuments(query);
    const assignments = await Assignment.find(query)
      .populate('complaintId')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: assignments,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });
    if (assignment.technicianId.toString() !== req.user._id.toString()) throw new Error('Not your assignment.');
    if (assignment.status !== 'assigned') throw new Error('Assignment cannot be accepted in its current state.');

    assignment.status = 'accepted';
    assignment.acceptedAt = new Date();
    await assignment.save();

    const complaint = await Complaint.findById(assignment.complaintId);
    
    await ComplaintHistory.create({
      complaintId: complaint._id,
      actorId: req.user._id,
      action: 'assignment_accepted',
      fromStatus: complaint.status,
      toStatus: complaint.status,
      comment: 'Technician accepted the assignment.'
    });

    createNotification({
      recipientId: complaint.studentId,
      type: 'assignment_accepted',
      title: 'Assignment Accepted',
      message: `A technician has accepted your complaint ${complaint.complaintNumber}.`,
      complaintId: complaint._id,
      assignmentId: assignment._id
    }).catch(err => console.error(err));

    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const startAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });
    if (assignment.technicianId.toString() !== req.user._id.toString()) throw new Error('Not your assignment.');
    if (assignment.status !== 'accepted') throw new Error('Assignment must be accepted before starting.');

    assignment.status = 'in_progress';
    assignment.startedAt = new Date();
    await assignment.save();

    const complaint = await Complaint.findById(assignment.complaintId);
    const oldStatus = complaint.status;
    complaint.status = 'in_progress';
    await complaint.save();

    await ComplaintHistory.create({
      complaintId: complaint._id,
      actorId: req.user._id,
      action: 'work_started',
      fromStatus: oldStatus,
      toStatus: 'in_progress',
      comment: 'Technician started working on the complaint.'
    });

    createNotification({
      recipientId: complaint.studentId,
      type: 'work_started',
      title: 'Work Started',
      message: `A technician has started working on your complaint ${complaint.complaintNumber}.`,
      complaintId: complaint._id,
      assignmentId: assignment._id
    }).catch(err => console.error(err));

    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resolveAssignment = async (req, res) => {
  try {
    const { resolutionNotes } = req.body;
    if (!resolutionNotes || resolutionNotes.trim().length === 0) throw new Error('Resolution notes are required.');

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });
    if (assignment.technicianId.toString() !== req.user._id.toString()) throw new Error('Not your assignment.');
    if (assignment.status !== 'in_progress') throw new Error('Assignment must be in progress to resolve.');

    assignment.status = 'completed';
    assignment.completedAt = new Date();
    assignment.resolutionNotes = resolutionNotes.trim();
    await assignment.save();

    const complaint = await Complaint.findById(assignment.complaintId);
    const oldStatus = complaint.status;
    complaint.status = 'resolved';
    complaint.resolvedAt = new Date();
    await complaint.save();

    await ComplaintHistory.create({
      complaintId: complaint._id,
      actorId: req.user._id,
      action: 'resolved',
      fromStatus: oldStatus,
      toStatus: 'resolved',
      comment: `Resolution Notes: ${resolutionNotes.trim()}`
    });

    createNotification({
      recipientId: complaint.studentId,
      type: 'complaint_resolved',
      title: 'Complaint Resolved',
      message: `Your complaint ${complaint.complaintNumber} has been resolved.`,
      complaintId: complaint._id,
      assignmentId: assignment._id
    }).catch(err => console.error(err));

    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const reassignTechnician = async (req, res) => {
  try {
    const { id: assignmentId } = req.params;
    const { technicianId } = req.body;

    const oldAssignment = await Assignment.findById(assignmentId);
    if (!oldAssignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });
    if (['completed', 'cancelled'].includes(oldAssignment.status)) throw new Error('Cannot reassign a completed or cancelled assignment.');

    const complaint = await Complaint.findById(oldAssignment.complaintId);
    if (complaint.status === 'closed') throw new Error('Cannot reassign a closed complaint.');

    const newTechnician = await User.findOne({ _id: technicianId, role: 'technician', isActive: true });
    if (!newTechnician) throw new Error('Invalid or inactive new technician.');

    if (oldAssignment.technicianId.toString() === technicianId) throw new Error('Already assigned to this technician.');

    // Cancel old
    oldAssignment.status = 'cancelled';
    await oldAssignment.save();

    // Create new
    const newAssignment = await Assignment.create({
      complaintId: complaint._id,
      technicianId,
      assignedBy: req.user._id,
      status: 'assigned',
      assignedAt: new Date()
    });

    // Update complaint status if it was in_progress back to assigned
    const oldStatus = complaint.status;
    if (complaint.status !== 'assigned') {
      complaint.status = 'assigned';
      await complaint.save();
    }

    await ComplaintHistory.create({
      complaintId: complaint._id,
      actorId: req.user._id,
      action: 'reassigned',
      fromStatus: oldStatus,
      toStatus: 'assigned',
      comment: `Reassigned to technician ${newTechnician.name}`
    });

    createNotification({
      recipientId: technicianId,
      type: 'complaint_reassigned',
      title: 'New Complaint Assigned',
      message: `You have been reassigned to complaint ${complaint.complaintNumber}.`,
      complaintId: complaint._id,
      assignmentId: newAssignment._id
    }).catch(err => console.error(err));

    res.status(200).json({ success: true, data: newAssignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
