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

// MongoDB 6+ supports $in in partial filters. Completed/cancelled rows remain history.
assignmentSchema.index({ complaintId: 1 }, {
  unique: true,
  name: 'one_active_assignment_per_complaint',
  partialFilterExpression: { status: { $in: ['assigned', 'accepted', 'in_progress'] } }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
