import { randomUUID } from 'node:crypto';
import Assignment from '../models/Assignment.js';
import Complaint from '../models/Complaint.js';
import ComplaintHistory from '../models/ComplaintHistory.js';
import User from '../models/User.js';
import { createNotification } from '../services/notification/notificationService.js';

// A short-lived per-complaint claim serializes assign/reassign on standalone MongoDB.
// Rollback handles request failures; this is not a multi-document transaction.
const claimComplaint = async (id, token) => {
  const complaint = await Complaint.findOneAndUpdate(
    { _id: id, status: { $nin: ['resolved', 'closed'] }, assignmentLock: { $exists: false } },
    { $set: { assignmentLock: token } }, { new: true }
  );
  if (complaint) return complaint;
  const current = await Complaint.findById(id);
  if (!current) throw new Error('Complaint not found.');
  if (['resolved', 'closed'].includes(current.status)) throw new Error(`Cannot assign a ${current.status} complaint.`);
  throw new Error('Assignment change already in progress. Please refresh and try again.');
};

export const assignTechnician = async (req, res) => {
  const token = randomUUID();
  let complaint, assignment, history;
  let committed = false;
  try {
    const { id: complaintId } = req.params;
    const { technicianId } = req.body;
    const technician = await User.findOne({ _id: technicianId, role: 'technician', isActive: true, roleApproval: { $ne: 'pending' } });
    if (!technician) throw new Error('Invalid or inactive technician.');
    complaint = await claimComplaint(complaintId, token);
    if (await Assignment.exists({ complaintId, status: { $in: ['assigned', 'accepted', 'in_progress'] } })) {
      throw new Error('Complaint already has an active assignment.');
    }
    assignment = await Assignment.create({ complaintId, technicianId, assignedBy: req.user._id, status: 'assigned', assignedAt: new Date() });
    history = await ComplaintHistory.create({ complaintId, actorId: req.user._id, action: 'assigned', fromStatus: complaint.status, toStatus: 'assigned', comment: `Assigned to technician ${technician.name}` });
    const result = await Complaint.updateOne(
      { _id: complaintId, assignmentLock: token, status: complaint.status },
      { $set: { status: 'assigned' }, $unset: { assignmentLock: 1 } }
    );
    if (!result.modifiedCount) throw new Error('Complaint changed. Refresh and try again.');
    committed = true;
    createNotification({ recipientId: technicianId, type: 'complaint_assigned', title: 'New Complaint Assigned', message: `You have been assigned to complaint ${complaint.complaintNumber}.`, complaintId, assignmentId: assignment._id }).catch(err => console.error(err));
    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    try {
      if (!committed) {
        if (history) await ComplaintHistory.deleteOne({ _id: history._id });
        if (assignment) await Assignment.deleteOne({ _id: assignment._id });
        if (complaint) await Complaint.updateOne({ _id: complaint._id, assignmentLock: token }, { $unset: { assignmentLock: 1 } });
      }
    } catch (rollbackError) {
      console.error('Assignment rollback failed:', rollbackError);
      return res.status(500).json({ success: false, message: 'Assignment recovery failed. Ask an administrator to check this complaint before retrying.' });
    }
    res.status(error.message.includes('not found') ? 404 : 400).json({ success: false, message: error.code === 11000 ? 'Complaint already has an active assignment.' : error.message });
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
  const token = randomUUID();
  let complaint, oldAssignment, newAssignment, history;
  let cancelled = false, committed = false;
  try {
    const { technicianId } = req.body;
    oldAssignment = await Assignment.findById(req.params.id);
    if (!oldAssignment) throw new Error('Assignment not found.');
    if (['completed', 'cancelled'].includes(oldAssignment.status)) throw new Error('Cannot reassign a completed or cancelled assignment.');
    const technician = await User.findOne({ _id: technicianId, role: 'technician', isActive: true, roleApproval: { $ne: 'pending' } });
    if (!technician) throw new Error('Invalid or inactive new technician.');
    if (String(oldAssignment.technicianId) === technicianId) throw new Error('Already assigned to this technician.');
    complaint = await claimComplaint(oldAssignment.complaintId, token);
    const result = await Assignment.updateOne({ _id: oldAssignment._id, status: oldAssignment.status }, { $set: { status: 'cancelled' } });
    if (!result.modifiedCount) throw new Error('Assignment changed. Refresh and try again.');
    cancelled = true;
    newAssignment = await Assignment.create({ complaintId: complaint._id, technicianId, assignedBy: req.user._id, status: 'assigned', assignedAt: new Date() });
    history = await ComplaintHistory.create({ complaintId: complaint._id, actorId: req.user._id, action: 'reassigned', fromStatus: complaint.status, toStatus: 'assigned', comment: `Reassigned to technician ${technician.name}` });
    const updated = await Complaint.updateOne({ _id: complaint._id, assignmentLock: token, status: complaint.status }, { $set: { status: 'assigned' }, $unset: { assignmentLock: 1 } });
    if (!updated.modifiedCount) throw new Error('Complaint changed. Refresh and try again.');
    committed = true;
    createNotification({ recipientId: technicianId, type: 'complaint_reassigned', title: 'New Complaint Assigned', message: `You have been reassigned to complaint ${complaint.complaintNumber}.`, complaintId: complaint._id, assignmentId: newAssignment._id }).catch(err => console.error(err));
    res.status(200).json({ success: true, data: newAssignment });
  } catch (error) {
    try {
      if (!committed) {
        if (history) await ComplaintHistory.deleteOne({ _id: history._id });
        if (newAssignment) await Assignment.deleteOne({ _id: newAssignment._id });
        if (cancelled) await Assignment.updateOne({ _id: oldAssignment._id, status: 'cancelled' }, { $set: { status: oldAssignment.status } });
        if (complaint) await Complaint.updateOne({ _id: complaint._id, assignmentLock: token }, { $unset: { assignmentLock: 1 } });
      }
    } catch (rollbackError) {
      console.error('Reassignment rollback failed:', rollbackError);
      return res.status(500).json({ success: false, message: 'Assignment recovery failed. Ask an administrator to check this complaint before retrying.' });
    }
    res.status(error.message.includes('not found') ? 404 : 400).json({ success: false, message: error.code === 11000 ? 'Complaint already has an active assignment.' : error.message });
  }
};
