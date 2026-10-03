import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import complaintService from './complaintService.js';
import AssignmentPanel from './AssignmentPanel.jsx';

const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetails = async () => {
    try {
      const [compRes, histRes] = await Promise.all([
        complaintService.getComplaint(id),
        complaintService.getComplaintHistory(id)
      ]);
      setComplaint(compRes.data);
      setHistory(histRes.data);
    } catch (err) {
      setError(err?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="max-w-3xl mx-auto mt-8 p-4 bg-red-50 text-red-700 rounded">{error}</div>;
  if (!complaint) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link to="/complaints" className="text-sm text-sage-700 hover:underline mb-6 inline-block">
        &larr; Back to Complaints
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <div className="flex justify-between items-start mb-4 border-b border-sage-200 pb-4">
              <div>
                <h1 className="text-2xl font-semibold text-dark">{complaint.title}</h1>
                <p className="text-sm text-dark-50 mt-1">Ref: {complaint.complaintNumber}</p>
              </div>
              <span className="px-3 py-1 rounded bg-sage-100 text-sage-800 border border-sage-200 capitalize text-sm font-medium">
                {complaint.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="prose prose-sm text-dark mb-6">
              <p className="whitespace-pre-wrap">{complaint.description}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AssignmentPanel complaint={complaint} onUpdate={fetchDetails} />
          <div className="card-sage text-sm">
            <h3 className="font-semibold text-dark mb-3 uppercase tracking-wider text-xs border-b border-sage-300 pb-2">Properties</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-dark-50 text-xs">Category</dt>
                <dd className="font-medium capitalize text-dark">{complaint.category}</dd>
              </div>
              <div>
                <dt className="text-dark-50 text-xs">Priority</dt>
                <dd className="font-medium capitalize text-dark">{complaint.priority}</dd>
              </div>
              <div>
                <dt className="text-dark-50 text-xs">Location</dt>
                <dd className="font-medium text-dark">{complaint.location}</dd>
              </div>
              <div>
                <dt className="text-dark-50 text-xs">Reported By</dt>
                <dd className="font-medium text-dark">{complaint.studentId?.name || 'Unknown'}</dd>
              </div>
              <div>
                <dt className="text-dark-50 text-xs">Reported On</dt>
                <dd className="font-medium text-dark">{new Date(complaint.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="mt-8 card">
        <h3 className="text-lg font-semibold text-dark mb-6">Complaint History</h3>
        {history.length === 0 ? (
          <p className="text-sm text-dark-50">No history recorded yet.</p>
        ) : (
          <div className="space-y-6">
            {history.map((h, i) => (
              <div key={h._id} className="relative pl-6 border-l-2 border-sage-300 last:border-transparent pb-2">
                <div className="absolute w-3 h-3 bg-sage-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                <p className="text-sm font-medium text-dark capitalize">
                  {h.action}
                  {h.toStatus && ` → ${h.toStatus.replace('_', ' ')}`}
                </p>
                <p className="text-xs text-dark-50 mt-0.5">
                  by {h.actorId?.name} ({h.actorId?.role}) • {new Date(h.createdAt).toLocaleString()}
                </p>
                {h.comment && <p className="text-sm mt-2 text-dark bg-cream p-2 rounded">{h.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintDetails;
