import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [trends, setTrends] = useState([]);
  const [resolution, setResolution] = useState(null);
  const [technicians, setTechnicians] = useState([]);

  // Use the established sage colors for charts
  const COLORS = ['#C7D6AE', '#B7CAA0', '#9FB88A', '#87A574', '#6F8D5E', '#5A7349'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [ovRes, catRes, prioRes, trendRes, resRes, techRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/categories'),
          api.get('/analytics/priorities'),
          api.get('/analytics/trends?days=30'),
          api.get('/analytics/resolution-time'),
          api.get('/analytics/technicians')
        ]);

        setOverview(ovRes.data);
        setCategories(catRes.data);
        setPriorities(prioRes.data);
        setTrends(trendRes.data);
        setResolution(resRes.data);
        setTechnicians(techRes.data);
        setError(null);
      } catch (err) {
        setError('Unable to load analytics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-dark-50">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-dark-50">No data available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark">Analytics Dashboard</h1>
        <p className="text-sm text-dark-50">Institution-wide complaint and resolution statistics.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="card">
          <p className="text-xs text-dark-50 uppercase tracking-wide mb-1">Total</p>
          <p className="text-2xl font-semibold text-dark">{overview.totalComplaints}</p>
        </div>
        <div className="card">
          <p className="text-xs text-dark-50 uppercase tracking-wide mb-1">Pending</p>
          <p className="text-2xl font-semibold text-dark">{overview.pending}</p>
        </div>
        <div className="card">
          <p className="text-xs text-dark-50 uppercase tracking-wide mb-1">Assigned</p>
          <p className="text-2xl font-semibold text-dark">{overview.assigned}</p>
        </div>
        <div className="card">
          <p className="text-xs text-dark-50 uppercase tracking-wide mb-1">In Progress</p>
          <p className="text-2xl font-semibold text-dark">{overview.inProgress}</p>
        </div>
        <div className="card">
          <p className="text-xs text-dark-50 uppercase tracking-wide mb-1">Resolved</p>
          <p className="text-2xl font-semibold text-dark">{overview.resolved}</p>
        </div>
        <div className="card">
          <p className="text-xs text-dark-50 uppercase tracking-wide mb-1">Closed</p>
          <p className="text-2xl font-semibold text-dark">{overview.closed}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Trend Chart */}
        <div className="card">
          <h2 className="text-sm font-semibold text-dark mb-4 uppercase tracking-wide">Complaint Trend (Last 30 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EBD8" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#55584D'}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#55584D'}} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #C7D6AE', backgroundColor: '#FDFCF7' }} />
                <Line type="monotone" dataKey="count" stroke="#6F8D5E" strokeWidth={2} dot={{ r: 3, fill: '#6F8D5E' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Bar Chart */}
        <div className="card">
          <h2 className="text-sm font-semibold text-dark mb-4 uppercase tracking-wide">Complaints by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EBD8" />
                <XAxis dataKey="category" tick={{fontSize: 12, fill: '#55584D'}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#55584D'}} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#F0F4EB'}} contentStyle={{ borderRadius: '4px', border: '1px solid #C7D6AE', backgroundColor: '#FDFCF7' }} />
                <Bar dataKey="count" fill="#9FB88A" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Priority Distribution */}
        <div className="card">
          <h2 className="text-sm font-semibold text-dark mb-4 uppercase tracking-wide">Priority Distribution</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorities}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="priority"
                >
                  {priorities.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #C7D6AE', backgroundColor: '#FDFCF7' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {priorities.map((p, i) => (
              <div key={p.priority} className="flex items-center text-xs">
                <span className="w-3 h-3 inline-block rounded-full mr-1.5" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span className="capitalize text-dark-50">{p.priority}: {p.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Time */}
        <div className="card flex flex-col justify-center items-center text-center">
          <h2 className="text-sm font-semibold text-dark mb-2 uppercase tracking-wide w-full text-left">Resolution Time</h2>
          <div className="my-auto">
            <p className="text-4xl font-semibold text-dark mb-1">{resolution.averageHours}h</p>
            <p className="text-sm text-dark-50">Average time to resolve</p>
            <p className="text-xs text-sage-600 mt-4 bg-sage-50 px-3 py-1 rounded-md inline-block">
              Based on {resolution.resolvedCount} resolved complaints
            </p>
          </div>
        </div>
      </div>

      {/* Technician Workload Table */}
      <div className="card overflow-hidden">
        <h2 className="text-sm font-semibold text-dark mb-4 uppercase tracking-wide">Technician Workload</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream text-dark-50 border-b border-sage-200">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-md">Technician</th>
                <th className="px-4 py-3 font-medium">Assigned</th>
                <th className="px-4 py-3 font-medium">In Progress</th>
                <th className="px-4 py-3 font-medium rounded-tr-md">Resolved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {technicians.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-4 text-center text-dark-50">No technician data available.</td>
                </tr>
              ) : (
                technicians.map((tech) => (
                  <tr key={tech.technicianId} className="hover:bg-cream-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-dark">{tech.name}</td>
                    <td className="px-4 py-3 text-dark">{tech.assigned}</td>
                    <td className="px-4 py-3 text-dark">{tech.inProgress}</td>
                    <td className="px-4 py-3 text-dark">{tech.resolved}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
