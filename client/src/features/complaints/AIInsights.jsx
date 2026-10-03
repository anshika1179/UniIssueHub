import { useState, useEffect } from 'react';
import api from '../../services/api.js';

const AIInsights = ({ complaintId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await api.get(`/ai/complaint/${complaintId}`);
        setAnalysis(res.data);
      } catch (err) {
        setError('AI Analysis unavailable.');
      } finally {
        setLoading(false);
      }
    };
    if (complaintId) {
      fetchAnalysis();
    }
  }, [complaintId]);

  if (loading) return <div className="text-sm text-dark-50 py-2">Loading AI insights...</div>;
  if (error || !analysis) return null;

  return (
    <div className="card mt-6 border-sage-300 bg-white">
      <div className="flex items-center gap-2 mb-4 border-b border-sage-200 pb-3">
        <div className="w-6 h-6 bg-sage-500 rounded flex items-center justify-center text-white text-xs font-bold">
          AI
        </div>
        <h3 className="text-sm font-semibold text-dark uppercase tracking-wide">AI Recommendations</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-dark-50 uppercase tracking-wide">Category</p>
          <p className="text-sm font-medium capitalize text-dark">
            {analysis.categoryRecommendation || 'N/A'} 
            <span className="text-xs text-sage-600 ml-1">({Math.round(analysis.categoryConfidence * 100)}%)</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-dark-50 uppercase tracking-wide">Priority</p>
          <p className="text-sm font-medium capitalize text-dark">
            {analysis.priorityRecommendation || 'N/A'}
            <span className="text-xs text-sage-600 ml-1">({Math.round(analysis.priorityConfidence * 100)}%)</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-dark-50 uppercase tracking-wide">Urgency / Sentiment</p>
          <p className="text-sm font-medium capitalize text-dark">
            {analysis.urgency} <span className="text-dark-50 text-xs">/ {analysis.sentiment}</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-dark-50 uppercase tracking-wide">Estimated Resolution</p>
          <p className="text-sm font-medium text-dark">
            {analysis.estimatedHours ? `~${analysis.estimatedHours} hours` : 'N/A'}
          </p>
        </div>
      </div>

      {analysis.isDuplicate && analysis.matchedComplaints?.length > 0 && (
        <div className="mb-4 bg-orange-50 p-3 rounded border border-orange-200">
          <p className="text-xs font-semibold uppercase text-orange-800 mb-1">Possible Duplicates Detected</p>
          <ul className="text-xs text-dark space-y-1">
            {analysis.matchedComplaints.map(m => (
              <li key={m._id || m.complaintNumber}>
                &bull; <span className="font-medium">{m.complaintId?.complaintNumber || m.complaintNumber}</span> - {m.complaintId?.title || 'Unknown title'} 
                <span className="text-orange-600 ml-1">({Math.round(m.similarity * 100)}% match)</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.technicalSuggestions?.length > 0 && (
        <div className="bg-sage-50 p-3 rounded border border-sage-200">
          <p className="text-xs font-semibold uppercase text-sage-800 mb-2">Technical Suggestions</p>
          <ul className="text-sm text-dark space-y-1 pl-4 list-disc">
            {analysis.technicalSuggestions.map((sug, i) => (
              <li key={i}>{sug}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-3 text-right">
        <span className="text-[10px] text-dark-50 uppercase tracking-wide">
          Powered by: {analysis.provider} ({analysis.model})
        </span>
      </div>
    </div>
  );
};

export default AIInsights;
