// localProvider.js - Rule-based local AI fallback
import Complaint from '../../../models/Complaint.js';

const CATEGORIES = ['electricity', 'water', 'internet', 'cleanliness', 'maintenance', 'security', 'food', 'hostel', 'academic', 'other'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export const categorize = async (title, description) => {
  const text = (title + ' ' + description).toLowerCase();
  
  const rules = {
    electricity: ['power', 'electricity', 'light', 'fan', 'socket', 'plug', 'switch', 'current', 'outage'],
    water: ['water', 'leak', 'plumbing', 'pipe', 'tap', 'washroom', 'drain', 'overflow'],
    internet: ['wifi', 'internet', 'network', 'router', 'connection', 'slow', 'disconnect'],
    cleanliness: ['dirty', 'clean', 'sweep', 'dust', 'garbage', 'trash', 'smell', 'hygiene'],
    maintenance: ['broken', 'repair', 'door', 'window', 'bed', 'furniture', 'paint'],
    security: ['guard', 'security', 'theft', 'stolen', 'unauthorized', 'lock'],
    food: ['food', 'mess', 'canteen', 'meal', 'stale', 'taste'],
    hostel: ['room', 'hostel', 'roommate', 'noise'],
    academic: ['class', 'library', 'lab', 'teacher', 'attendance', 'exam']
  };

  for (const [category, keywords] of Object.entries(rules)) {
    if (keywords.some(kw => text.includes(kw))) {
      return { category, confidence: 0.85, source: 'local-rule' };
    }
  }

  return { category: 'other', confidence: 0.50, source: 'local-rule' };
};

export const recommendPriority = async (title, description, category) => {
  const text = (title + ' ' + description).toLowerCase();
  
  const criticalWords = ['fire', 'flood', 'blood', 'theft', 'emergency', 'danger', 'hazard'];
  const highWords = ['outage', 'exam', 'broken pipe', 'no water', 'urgent'];
  
  if (criticalWords.some(w => text.includes(w))) {
    return { priority: 'critical', confidence: 0.90, reason: 'Contains emergency/critical keywords.' };
  }
  
  if (highWords.some(w => text.includes(w))) {
    return { priority: 'high', confidence: 0.80, reason: 'Contains high-urgency keywords.' };
  }

  return { priority: 'medium', confidence: 0.70, reason: 'Standard operational issue.' };
};

export const analyzeSentiment = async (title, description) => {
  const text = (title + ' ' + description).toLowerCase();
  
  const negative = ['angry', 'frustrated', 'terrible', 'worst', 'pathetic', 'unacceptable', 'bad', 'poor'];
  const positive = ['good', 'great', 'thanks', 'appreciate', 'happy'];
  
  let sentiment = 'neutral';
  if (negative.some(w => text.includes(w))) sentiment = 'negative';
  else if (positive.some(w => text.includes(w))) sentiment = 'positive';
  
  let urgency = 'medium';
  if (text.includes('urgent') || text.includes('asap') || text.includes('immediately')) urgency = 'high';
  if (text.includes('whenever') || text.includes('no rush')) urgency = 'low';

  return { sentiment, urgency, confidence: 0.75 };
};

export const detectDuplicates = async (title, description, category, location) => {
  // Simple MongoDB text search or regex based similarity fallback
  // In a real app we'd use vector embeddings. Here we do a crude word match.
  const words = title.toLowerCase().split(' ').filter(w => w.length > 4);
  
  if (words.length === 0) {
    return { isDuplicate: false, confidence: 1.0, matchedComplaints: [] };
  }

  // Find recent complaints in same category/location
  const recentComplaints = await Complaint.find({
    category,
    status: { $nin: ['closed', 'rejected'] }
  }).sort({ createdAt: -1 }).limit(10);

  const matches = [];
  
  for (const comp of recentComplaints) {
    let matchCount = 0;
    const compText = (comp.title + ' ' + comp.description).toLowerCase();
    
    for (const w of words) {
      if (compText.includes(w)) matchCount++;
    }
    
    const similarity = matchCount / words.length;
    if (similarity > 0.6) {
      matches.push({
        complaintId: comp._id,
        complaintNumber: comp.complaintNumber,
        similarity: parseFloat(similarity.toFixed(2))
      });
    }
  }

  if (matches.length > 0) {
    matches.sort((a, b) => b.similarity - a.similarity);
    return { isDuplicate: true, confidence: matches[0].similarity, matchedComplaints: matches.slice(0, 3) };
  }

  return { isDuplicate: false, confidence: 0.90, matchedComplaints: [] };
};

export const estimateEta = async (category, priority) => {
  const baseHours = {
    electricity: 4, water: 6, internet: 12, cleanliness: 24, maintenance: 48, security: 2, food: 12, hostel: 24, academic: 72, other: 48
  };
  
  let est = baseHours[category] || 24;
  
  if (priority === 'critical') est = Math.max(1, est / 4);
  else if (priority === 'high') est = Math.max(2, est / 2);
  else if (priority === 'low') est = est * 2;
  
  return { estimatedHours: Math.round(est), confidence: 0.60, basis: 'Rule-based historical estimate for category and priority.' };
};

export const generateSuggestions = async (category, priority) => {
  const suggestionsMap = {
    electricity: ['Check main circuit breaker.', 'Verify if adjacent rooms have power.', 'Inspect reported plug/switch for burns.'],
    water: ['Shut off main valve if flooding.', 'Check for pipe blockages.', 'Inspect tap washer/seal.'],
    internet: ['Restart local router/access point.', 'Check WAN link status.', 'Verify user MAC address authorization.'],
    cleanliness: ['Dispatch cleaning staff to location.', 'Ensure adequate waste bins are available.'],
    maintenance: ['Assess if parts need ordering.', 'Secure area if broken glass/sharp edges exist.'],
  };

  return { suggestions: suggestionsMap[category] || ['Inspect the reported issue on site.', 'Document findings and update status.'] };
};
