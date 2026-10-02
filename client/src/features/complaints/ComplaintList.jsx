import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import complaintService from './complaintService.js';
import ComplaintCard from './ComplaintCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const ComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    page: 1,
    status: '',
    category: '',
    priority: ''
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const res = await complaintService.getComplaints(activeFilters);
      setComplaints(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err?.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-dark">Complaints</h1>
          <p className="text-sm text-dark-50 mt-1">
            {user?.role === 'student' ? 'Manage your reported issues' : 'View system complaints'}
          </p>
        </div>
        {user?.role === 'student' && (
          <button onClick={() => navigate('/complaints/new')} className="btn-primary">
            + New Complaint
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card-sage mb-6 py-4 flex flex-wrap gap-4 items-center">
        <span className="text-sm font-medium text-dark-50">Filter:</span>
        <select name="status" value={filters.status} onChange={handleFilterChange} className="input-field py-1.5 px-3 w-auto text-sm">
          <option value="">All Statuses</option>
          {['pending', 'reviewed', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'].map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        <select name="category" value={filters.category} onChange={handleFilterChange} className="input-field py-1.5 px-3 w-auto text-sm">
          <option value="">All Categories</option>
          {['electricity', 'water', 'internet', 'cleanliness', 'maintenance', 'security', 'food', 'hostel', 'academic', 'other'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select name="priority" value={filters.priority} onChange={handleFilterChange} className="input-field py-1.5 px-3 w-auto text-sm">
          <option value="">All Priorities</option>
          {['low', 'medium', 'high', 'critical'].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
      
      {loading ? (
        <div className="text-center py-12 text-dark-50">Loading complaints...</div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-sage-200">
          <p className="text-dark-50 mb-2">No complaints found matching your criteria.</p>
          {user?.role === 'student' && (
             <button onClick={() => navigate('/complaints/new')} className="text-sage-700 hover:underline">
               File your first complaint
             </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complaints.map(c => <ComplaintCard key={c._id} complaint={c} />)}
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

export default ComplaintList;
