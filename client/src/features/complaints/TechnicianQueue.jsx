import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import assignmentService from '../../services/assignmentService.js';
import ComplaintCard from './ComplaintCard.jsx';

const TechnicianQueue = () => {
  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    page: 1,
    status: ''
  });

  const fetchAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const res = await assignmentService.getMyAssignments(activeFilters);
      setAssignments(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err?.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) return;
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark">My Assignments</h1>
        <p className="text-sm text-dark-50 mt-1">Manage and resolve your assigned complaints.</p>
      </div>

      <div className="card-sage mb-6 py-4 flex gap-4 items-center">
        <span className="text-sm font-medium text-dark-50">Filter Status:</span>
        <select name="status" value={filters.status} onChange={handleFilterChange} className="input-field py-1.5 px-3 w-auto text-sm">
          <option value="">All</option>
          {['assigned', 'accepted', 'in_progress', 'completed', 'cancelled'].map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-dark-50">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-sage-200 text-dark-50">
          No assignments found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map(a => (
            <div key={a._id} className="relative">
              <div className="absolute top-2 right-2 z-10 text-xs font-semibold px-2 py-0.5 rounded bg-white shadow-sm border border-sage-200 capitalize text-sage-800">
                {a.status.replace('_', ' ')}
              </div>
              <ComplaintCard complaint={a.complaintId} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button 
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
            className="px-3 py-1 bg-white border border-sage-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-dark">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button 
            disabled={pagination.page === pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
            className="px-3 py-1 bg-white border border-sage-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TechnicianQueue;
