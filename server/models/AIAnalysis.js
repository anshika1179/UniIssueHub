import mongoose from 'mongoose';

const aiAnalysisSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true,
    unique: true,
    index: true
  },
  categoryRecommendation: String,
  categoryConfidence: Number,
  
  priorityRecommendation: String,
  priorityConfidence: Number,
  
  sentiment: String,
  urgency: String,
  urgencyConfidence: Number,
  
  isDuplicate: Boolean,
  duplicateConfidence: Number,
  matchedComplaints: [{
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
    complaintNumber: String,
    similarity: Number
  }],
  
  estimatedHours: Number,
  etaConfidence: Number,
  etaBasis: String,
  
  technicalSuggestions: [String],
  
  provider: String,
  model: String
}, {
  timestamps: true
});

const AIAnalysis = mongoose.model('AIAnalysis', aiAnalysisSchema);
export default AIAnalysis;
