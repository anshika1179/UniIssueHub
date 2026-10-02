import { useState, useEffect } from 'react';
import api from './services/api.js';

function App() {
  const [apiStatus, setApiStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await api.get('/health');
        setApiStatus(data);
      } catch (error) {
        setApiStatus({ success: false, message: 'API is not reachable' });
      } finally {
        setLoading(false);
      }
    };
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-sage-300 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-sage-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <h1 className="text-lg font-semibold text-dark tracking-tight">UniIssueHub</h1>
            </div>
            <nav className="hidden sm:flex items-center gap-6 text-sm">
              <span className="text-dark-50 hover:text-dark cursor-pointer transition-colors">Dashboard</span>
              <span className="text-dark-50 hover:text-dark cursor-pointer transition-colors">Complaints</span>
              <span className="text-dark-50 hover:text-dark cursor-pointer transition-colors">Analytics</span>
              <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center">
                <span className="text-sage-700 text-xs font-medium">A</span>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-dark mb-2">
            Smart Campus Complaint Management
          </h2>
          <p className="text-dark-50 text-sm sm:text-base max-w-2xl">
            Submit, track, and resolve campus issues efficiently. UniIssueHub uses
            AI-powered categorization to route your complaints to the right department.
          </p>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Complaints', value: '—', sub: 'Phase 3' },
            { label: 'In Progress', value: '—', sub: 'Phase 4' },
            { label: 'Resolved', value: '—', sub: 'Phase 4' },
            { label: 'Avg. Resolution', value: '—', sub: 'Phase 7' },
          ].map((stat) => (
            <div key={stat.label} className="card">
              <p className="text-xs text-dark-50 uppercase tracking-wide mb-1">{stat.label}</p>
              <p className="text-2xl font-semibold text-dark">{stat.value}</p>
              <p className="text-xs text-sage-500 mt-1">{stat.sub}</p>
            </div>
          ))}
        </section>

        {/* Two Column Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Panel */}
          <div className="lg:col-span-2">
            <div className="card-sage">
              <h3 className="section-title">Recent Activity</h3>
              <p className="section-subtitle mb-4">Complaint activity will appear here</p>
              <div className="space-y-3">
                {['Infrastructure', 'Academic', 'Hostel', 'IT Services'].map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between bg-white rounded-md px-4 py-3 border border-sage-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-sage-500" />
                      <span className="text-sm text-dark font-medium">{cat}</span>
                    </div>
                    <span className="text-xs text-dark-50 bg-cream px-2.5 py-1 rounded">Pending — Phase 3</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* API Status */}
            <div className="card">
              <h3 className="text-sm font-semibold text-dark mb-3">System Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-50">Frontend</span>
                  <span className="text-sage-600 font-medium">● Online</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-50">API Server</span>
                  {loading ? (
                    <span className="text-dark-50">Checking...</span>
                  ) : apiStatus?.success ? (
                    <span className="text-sage-600 font-medium">● Online</span>
                  ) : (
                    <span className="text-red-500 font-medium">● Offline</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-50">Database</span>
                  <span className="text-dark-50">Phase 1</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-sm font-semibold text-dark mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="btn-primary w-full text-sm" disabled>
                  Submit Complaint — Phase 3
                </button>
                <button className="btn-secondary w-full text-sm" disabled>
                  View Dashboard — Phase 2
                </button>
                <button className="btn-outline w-full text-sm" disabled>
                  View Analytics — Phase 7
                </button>
              </div>
            </div>

            {/* Phase Info */}
            <div className="card-sage">
              <h3 className="text-sm font-semibold text-dark mb-2">Development Phase</h3>
              <p className="text-xs text-dark-50 leading-relaxed">
                Phase 1 — Project Foundation is complete. The MERN stack
                is initialized with React, Express, MongoDB, and Tailwind CSS.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['React', 'Express', 'MongoDB', 'Tailwind'].map((tech) => (
                  <span
                    key={tech}
                    className="text-xs bg-sage-300 text-sage-900 px-2 py-0.5 rounded font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-sage-200 pt-6 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-dark-50">
              UniIssueHub — Smart Campus Complaint & Grievance Management
            </p>
            <p className="text-xs text-dark-50">
              Built with MERN Stack
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
