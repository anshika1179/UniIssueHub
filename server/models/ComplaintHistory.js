import mongoose from 'mongoose';

const complaintHistorySchema = new mongoose.Schema({
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', index: true, required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  fromStatus: { type: String },
  toStatus: { type: String },
  comment: { type: String }
}, {
  timestamps: true
});

const ComplaintHistory = mongoose.model('ComplaintHistory', complaintHistorySchema);
export default ComplaintHistory;
