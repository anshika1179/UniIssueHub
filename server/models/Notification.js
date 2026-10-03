import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'complaint_created',
      'complaint_assigned',
      'complaint_reassigned',
      'assignment_accepted',
      'work_started',
      'complaint_resolved',
      'complaint_closed'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    index: true
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Compound index for efficient unread queries per user
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
// Index for deduplication checks
notificationSchema.index({ recipientId: 1, type: 1, complaintId: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
