import * as localProvider from './providers/localProvider.js';
import AIAnalysis from '../../models/AIAnalysis.js';
import Complaint from '../../models/Complaint.js';

// Factory to select provider based on config (future proofing)
const getProvider = () => {
  const providerName = process.env.AI_PROVIDER || 'local';
  if (providerName === 'local') {
    return localProvider;
  }
  // Fallback to local if unknown
  return localProvider;
};

export const analyzeComplaint = async (complaintId) => {
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) throw new Error('Complaint not found.');

    const provider = getProvider();
    
    // Run AI analysis tasks in parallel
    const [
      catResult,
      priResult,
      sentResult,
      dupResult,
      etaResult,
      sugResult
    ] = await Promise.all([
      provider.categorize(complaint.title, complaint.description),
      provider.recommendPriority(complaint.title, complaint.description, complaint.category),
      provider.analyzeSentiment(complaint.title, complaint.description),
      provider.detectDuplicates(complaint.title, complaint.description, complaint.category, complaint.location, complaint._id),
      provider.estimateEta(complaint.category, complaint.priority),
      provider.generateSuggestions(complaint.category, complaint.priority)
    ]);

    // Save to AIAnalysis model
    const analysis = await AIAnalysis.findOneAndUpdate(
      { complaintId },
      {
        categoryRecommendation: catResult.category,
        categoryConfidence: catResult.confidence,
        
        priorityRecommendation: priResult.priority,
        priorityConfidence: priResult.confidence,
        
        sentiment: sentResult.sentiment,
        urgency: sentResult.urgency,
        urgencyConfidence: sentResult.confidence,
        
        isDuplicate: dupResult.isDuplicate,
        duplicateConfidence: dupResult.confidence,
        matchedComplaints: dupResult.matchedComplaints,
        
        estimatedHours: etaResult.estimatedHours,
        etaConfidence: etaResult.confidence,
        etaBasis: etaResult.basis,
        
        technicalSuggestions: sugResult.suggestions,
        
        provider: process.env.AI_PROVIDER || 'local',
        model: 'rule-based-v1'
      },
      { upsert: true, new: true }
    );

    return analysis;
  } catch (error) {
    console.error('AI Analysis failed:', error.message);
    throw error;
  }
};
