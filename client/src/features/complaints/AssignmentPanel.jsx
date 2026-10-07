import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import assignmentService from '../../services/assignmentService.js';
import api from '../../services/api.js';

const AssignmentPanel = ({ complaint, onUpdate }) => {
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isStaff = ['admin', 'warden'].includes(user?.role);
  const isTechnician = user?.role === 'technician';

  const loadAssignment = useCallback(async () => {
    const res = await assignmentService.getAssignment(complaint._id);
    const active = (res.data || []).find(a => ['assigned', 'accepted', 'in_progress', 'completed'].includes(a.status));
    setAssignment(active || null);
  }, [complaint._id]);

  useEffect(() => {
    loadAssignment().catch(() => setAssignment(null));
  }, [loadAssignment, complaint.status]);

  useEffect(() => {
    if (isStaff && ['pending', 'assigned'].includes(complaint.status)) {
      const loadTechs = async () => {
        try {
          const res = await api.get('/users/technicians');
          setTechnicians(res.data);
        } catch (err) {
          console.error(err);
        }
      };
      loadTechs();
    }
  }, [isStaff, complaint.status]);

  const handleAction = async (actionFn, payload = null) => {
    setLoading(true);
    setError('');
    try {
      if (payload) await actionFn(payload);
      else await actionFn();
      await loadAssignment();
      await onUpdate();
    } catch (err) {
      setError(err?.message || 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  const onAssign = () => handleAction(() => assignmentService.assignTechnician(complaint._id, selectedTech));
  const onReassign = () => handleAction(() => assignmentService.reassignTechnician(assignment._id, selectedTech));
  const onAccept = () => handleAction(() => assignmentService.acceptAssignment(assignment._id));
  const onStart = () => handleAction(() => assignmentService.startWork(assignment._id));
  const onResolve = () => handleAction(() => assignmentService.resolveComplaint(assignment._id, resolutionNotes));
  const onClose = () => handleAction(() => assignmentService.closeComplaint(complaint._id));

  // Students see assignment status
  if (user?.role === 'student') {
    if (!assignment) return null;
    return (
      <div className="card mt-6 border-sage-300 bg-sage-50">
        <h3 className="text-sm font-semibold text-dark mb-2 uppercase tracking-wide">Assignment Status</h3>
        <p className="text-sm text-dark-50">Assigned to: {assignment.technicianId?.name}</p>
        <p className="text-sm text-dark-50 capitalize">Status: {assignment.status.replace('_', ' ')}</p>
        {assignment.resolutionNotes && (
          <div className="mt-3 bg-white p-3 rounded border border-sage-200">
            <span className="text-xs font-semibold uppercase text-sage-800">Resolution Notes:</span>
            <p className="text-sm text-dark mt-1">{assignment.resolutionNotes}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card mt-6">
      <h3 className="text-lg font-semibold text-dark mb-4">Assignment Controls</h3>
      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

      {/* Admin/Warden Assign */}
      {isStaff && ['pending', 'assigned', 'in_progress'].includes(complaint.status) && (
        <div className="mb-4">
          {!assignment ? (
            <div className="flex gap-2">
              <select className="input-field py-2" value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)}>
                <option value="">Select Technician...</option>
                {technicians.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
              <button disabled={!selectedTech || loading} onClick={onAssign} className="btn-primary py-2">
                Assign
              </button>
            </div>
          ) : (
            <div className="bg-sage-50 p-3 rounded border border-sage-200 mb-4">
              <p className="text-sm text-dark font-medium">Current Assignment</p>
              <p className="text-sm text-dark-50 mt-1">Technician: {assignment.technicianId?.name}</p>
              <p className="text-sm text-dark-50 capitalize">Status: {assignment.status.replace('_', ' ')}</p>
              {['assigned', 'accepted'].includes(assignment.status) && (
                <div className="mt-3 pt-3 border-t border-sage-200 flex gap-2">
                  <select className="input-field py-1.5 text-sm" value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)}>
                    <option value="">Reassign to...</option>
                    {technicians.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                  <button disabled={!selectedTech || loading} onClick={onReassign} className="btn-secondary py-1.5 text-sm">
                    Reassign
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Admin/Warden Close */}
      {isStaff && complaint.status === 'resolved' && (
        <div>
          <div className="bg-green-50 p-3 rounded border border-green-200 mb-4">
            <span className="text-xs font-semibold uppercase text-green-800">Resolution Notes:</span>
            <p className="text-sm text-dark mt-1">{assignment?.resolutionNotes}</p>
          </div>
          <button disabled={loading} onClick={onClose} className="btn-primary w-full bg-sage-600 hover:bg-sage-700">
            Close Complaint
          </button>
        </div>
      )}

      {/* Technician Controls */}
      {isTechnician && assignment && (
        <div className="space-y-4">
          <div className="bg-sage-50 p-3 rounded border border-sage-200">
            <p className="text-sm text-dark font-medium capitalize">Status: {assignment.status.replace('_', ' ')}</p>
          </div>
          
          {assignment.status === 'assigned' && (
            <button disabled={loading} onClick={onAccept} className="btn-primary w-full">
              Accept Assignment
            </button>
          )}

          {assignment.status === 'accepted' && (
            <button disabled={loading} onClick={onStart} className="btn-secondary w-full">
              Start Work
            </button>
          )}

          {assignment.status === 'in_progress' && (
            <div>
              <textarea 
                className="input-field mb-3" 
                rows="3" 
                placeholder="Enter resolution notes..."
                value={resolutionNotes}
                onChange={e => setResolutionNotes(e.target.value)}
              />
              <button disabled={!resolutionNotes.trim() || loading} onClick={onResolve} className="btn-primary w-full bg-green-600 hover:bg-green-700 border-none">
                Mark as Resolved
              </button>
            </div>
          )}

          {['completed', 'cancelled'].includes(assignment.status) && (
            <p className="text-sm text-dark-50 text-center">Assignment {assignment.status}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentPanel;
