import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  complaintNumber: { type: String, unique: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  title: { type: String, required: true, minlength: 5, maxlength: 150 },
  description: { type: String, required: true, minlength: 10, maxlength: 2000 },
  category: { 
    type: String, 
    enum: ['electricity', 'water', 'internet', 'cleanliness', 'maintenance', 'security', 'food', 'hostel', 'academic', 'other'],
    required: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  location: { type: String, required: true, minlength: 1, maxlength: 300 },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'pending',
    index: true
  },
  attachments: [{ type: String }],
  assignmentLock: { type: String, select: false },
  resolvedAt: { type: Date },
  closedAt: { type: Date }
}, {
  timestamps: true
});

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
