import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true,
    index: true
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['assigned', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'assigned'
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  resolutionNotes: {
    type: String,
    maxlength: 2000
  }
}, {
  timestamps: true
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
