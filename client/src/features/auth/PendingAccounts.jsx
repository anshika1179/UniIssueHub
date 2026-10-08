import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';

export default function PendingAccounts() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');
  const load = async () => {
    setError('');
    try { const result = await api.get('/users/pending'); setUsers(result.data); }
    catch (err) { setError(err.message || 'Could not load pending accounts.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const approve = async (user) => {
    const role = roles[user._id] || user.requestedRole;
    if (!window.confirm(`Assign ${role} access to ${user.name} (${user.email})?`)) return;
    setSaving(user._id); setError(''); setMessage('');
    try {
      await api.patch(`/users/${user._id}/role`, { role });
      setMessage(`${user.name} can now sign in as ${role}.`);
      await load();
    } catch (err) { setError(err.message || 'Could not assign the role.'); }
    finally { setSaving(''); }
  };
  return <div className="max-w-4xl mx-auto py-8 px-4">
    <Link to="/dashboard" className="text-sm text-sage-700 hover:underline">&larr; Back to Dashboard</Link>
    <h1 className="text-2xl font-semibold text-dark mt-6 mb-2">Pending accounts</h1>
    <p className="text-sm text-sage-700 mb-6">Non-student signups cannot sign in until you assign their role. Verify each person's identity before granting staff or admin access.</p>
    {error && <p role="alert" className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error} <button onClick={load} className="underline">Refresh</button></p>}
    {message && <p role="status" className="mb-4 p-3 bg-sage-100 text-sage-900 rounded">{message}</p>}
    {loading ? <p>Loading...</p> : users.length === 0 ? <div className="card">No pending accounts.</div> :
      <div className="space-y-4">{users.map(user => <div key={user._id} className="card flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0"><h2 className="font-semibold text-dark">{user.name}</h2><p className="text-sm text-sage-700 break-all">{user.email}</p><p className="text-xs text-sage-700 mt-1">Requested: {user.requestedRole} | {new Date(user.createdAt).toLocaleDateString()}</p></div>
        <label className="text-sm text-dark">Assign role<select aria-label={`Role for ${user.email}`} value={roles[user._id] || user.requestedRole} onChange={e => setRoles(prev => ({...prev, [user._id]: e.target.value}))} className="input-field mt-1 capitalize" disabled={Boolean(saving)}>
          {['student', 'technician', 'warden', 'admin'].map(role => <option key={role} value={role}>{role}</option>)}
        </select></label>
        <button onClick={() => approve(user)} disabled={Boolean(saving)} className="btn-primary disabled:opacity-50">{saving === user._id ? 'Saving...' : 'Assign role'}</button>
      </div>)}</div>}
  </div>;
}
