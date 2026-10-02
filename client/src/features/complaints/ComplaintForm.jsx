import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import complaintService from './complaintService.js';

const CATEGORIES = ['electricity', 'water', 'internet', 'cleanliness', 'maintenance', 'security', 'food', 'hostel', 'academic', 'other'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const ComplaintForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'maintenance',
    priority: 'medium',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.title.trim().length < 5) return setError('Title must be at least 5 characters long.');
    if (form.description.trim().length < 10) return setError('Description must be at least 10 characters long.');
    if (form.location.trim().length < 1) return setError('Location is required.');

    setLoading(true);
    try {
      await complaintService.createComplaint(form);
      navigate('/complaints');
    } catch (err) {
      setError(err?.message || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-dark">File a Complaint</h1>
        <button onClick={() => navigate('/complaints')} className="text-sm text-sage-700 hover:underline">
          &larr; Back to List
        </button>
      </div>

      <div className="card">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Title</label>
            <input 
              type="text" 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              required
              minLength={5}
              maxLength={150}
              className="input-field" 
              placeholder="Brief summary of the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="input-field capitalize">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} className="input-field capitalize">
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">Location</label>
            <input 
              type="text" 
              name="location" 
              value={form.location} 
              onChange={handleChange} 
              required
              maxLength={300}
              className="input-field" 
              placeholder="e.g., Hostel A - Room 204"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">Description</label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              className="input-field resize-none" 
              placeholder="Provide detailed information..."
            />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
