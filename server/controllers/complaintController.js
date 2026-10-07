import Complaint from '../models/Complaint.js';
import Assignment from '../models/Assignment.js';
import ComplaintHistory from '../models/ComplaintHistory.js';
import Counter from '../models/Counter.js';
import { analyzeComplaint } from '../services/ai/aiService.js';
import { createNotification } from '../services/notification/notificationService.js';

const VALID_CATEGORIES = ['electricity', 'water', 'internet', 'cleanliness', 'maintenance', 'security', 'food', 'hostel', 'academic', 'other'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];

export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, location } = req.body;

    // Validate lengths and presence
    if (!title || title.trim().length < 5 || title.trim().length > 150) {
      return res.status(400).json({ success: false, message: 'Title must be between 5 and 150 characters.' });
    }
    if (!description || description.trim().length < 10 || description.trim().length > 2000) {
      return res.status(400).json({ success: false, message: 'Description must be between 10 and 2000 characters.' });
    }
    if (!location || location.trim().length < 1 || location.trim().length > 300) {
      return res.status(400).json({ success: false, message: 'Location must be between 1 and 300 characters.' });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category.' });
    }
    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority.' });
    }

    // Generate complaintNumber UIH-{YEAR}-{SEQ}
    const year = new Date().getFullYear();
    const counterId = `complaint_${year}`;
    
    let counter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    
    const seqStr = String(counter.seq).padStart(6, '0');
    const complaintNumber = `UIH-${year}-${seqStr}`;

    const complaint = await Complaint.create({
      complaintNumber,
      studentId: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      location: location.trim(),
      status: 'pending' // Enforced creation status
    });

    await ComplaintHistory.create({
      complaintId: complaint._id,
      actorId: req.user._id,
      action: 'created',
      toStatus: 'pending',
      comment: 'Complaint submitted.'
    });

    // Phase 5 AI Intelligence (Fire & Forget)
    analyzeComplaint(complaint._id).catch(err => {
      console.error(`AI Analysis failed for ${complaint._id}:`, err.message);
    });

    // Phase 6 Notifications (Fire & Forget)
    createNotification({
      recipientId: req.user._id, // student
      type: 'complaint_created',
      title: 'Complaint Created',
      message: `Your complaint ${complaintNumber} has been submitted successfully.`,
      complaintId: complaint._id
    }).catch(err => console.error(err));

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, priority } = req.query;
    
    const query = {};
    
    // Ownership enforcement
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'technician') {
      const complaintIds = await Assignment.distinct('complaintId', { technicianId: req.user._id, status: { $ne: 'cancelled' } });
      query._id = { $in: complaintIds };
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const limitNum = Math.min(Math.max(parseInt(limit), 1), 100);
    const skip = (Math.max(parseInt(page), 1) - 1) * limitNum;

    const total = await Complaint.countDocuments(query);
    const grouped = await Complaint.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const statusCounts = Object.fromEntries(grouped.map(({ _id, count }) => [_id, count]));
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('studentId', 'name email');

    res.status(200).json({
      success: true,
      data: complaints,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        statusCounts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('studentId', 'name email');
    
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (req.user.role === 'technician' && !await Assignment.exists({ complaintId: complaint._id, technicianId: req.user._id, status: { $ne: 'cancelled' } })) {
      return res.status(403).json({ success: false, message: 'Not assigned to this complaint.' });
    }

    // Ownership check
    if (req.user.role === 'student' && complaint.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this complaint.' });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getComplaintHistory = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (req.user.role === 'technician' && !await Assignment.exists({ complaintId: complaint._id, technicianId: req.user._id, status: { $ne: 'cancelled' } })) {
      return res.status(403).json({ success: false, message: 'Not assigned to this complaint.' });
    }

    // Ownership check
    if (req.user.role === 'student' && complaint.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this complaint.' });
    }

    const history = await ComplaintHistory.find({ complaintId: complaint._id })
      .sort({ createdAt: -1 })
      .populate('actorId', 'name role');

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const closeComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });

    if (complaint.status !== 'resolved') {
      return res.status(400).json({ success: false, message: 'Complaint must be resolved before it can be closed.' });
    }

    complaint.status = 'closed';
    complaint.closedAt = new Date();
    await complaint.save();

    await ComplaintHistory.create({
      complaintId: complaint._id,
      actorId: req.user._id,
      action: 'closed',
      fromStatus: 'resolved',
      toStatus: 'closed',
      comment: 'Complaint officially closed by staff.'
    });

    // Notify student
    createNotification({
      recipientId: complaint.studentId,
      type: 'complaint_closed',
      title: 'Complaint Closed',
      message: `Your complaint ${complaint.complaintNumber} has been closed.`,
      complaintId: complaint._id
    }).catch(err => console.error(err));

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
