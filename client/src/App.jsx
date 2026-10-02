import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './features/auth/Login.jsx';
import Register from './features/auth/Register.jsx';

// ─── Minimal Dashboard (Phase 2 verification only) ───────────────────────────
const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-sage-300 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-sage-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="text-lg font-semibold text-dark tracking-tight">UniIssueHub</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-dark-50 hidden sm:block">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-dark mb-1">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-dark-50">
            You are signed in as a <strong>{user?.role}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Session Info */}
          <div className="card">
            <h2 className="text-sm font-semibold text-dark mb-3 uppercase tracking-wide">Session</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-dark-50">Name</dt>
                <dd className="text-dark font-medium">{user?.name}</dd>
              </div>
              <div>
                <dt className="text-dark-50">Email</dt>
                <dd className="text-dark font-medium">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-dark-50">Role</dt>
                <dd>
                  <span className="text-xs bg-sage-300 text-sage-900 px-2 py-0.5 rounded font-medium capitalize">
                    {user?.role}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Status */}
          <div className="card-sage">
            <h2 className="text-sm font-semibold text-dark mb-3 uppercase tracking-wide">Phase 2 — Auth</h2>
            <ul className="space-y-1.5 text-xs text-dark-50">
              {[
                'JWT via HttpOnly cookie',
                'bcrypt password hashing',
                'Role-Based Access Control',
                'Protected React routes',
                'Session restore on refresh',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-sage-600">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Next Phase */}
          <div className="card">
            <h2 className="text-sm font-semibold text-dark mb-3 uppercase tracking-wide">Coming Next</h2>
            <p className="text-xs text-dark-50 leading-relaxed">
              Phase 3 — Complaint Management will allow students to submit, track, and manage campus complaints.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['Submit', 'Track', 'Filter', 'History'].map((tag) => (
                <span key={tag} className="text-xs bg-cream-200 text-dark-50 border border-sage-200 px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
          {/* Catch-all → login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
