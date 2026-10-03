import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './features/auth/Login.jsx';
import Register from './features/auth/Register.jsx';
import ComplaintList from './features/complaints/ComplaintList.jsx';
import ComplaintForm from './features/complaints/ComplaintForm.jsx';
import ComplaintDetails from './features/complaints/ComplaintDetails.jsx';
import TechnicianQueue from './features/complaints/TechnicianQueue.jsx';

// ─── Minimal Dashboard ───────────────────────────
const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-sage-300 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-sage-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="text-lg font-semibold text-dark tracking-tight">UniIssueHub</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-dark-50 hidden sm:block">{user?.email}</span>
              <button
                onClick={logout}
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
          {/* Phase 3 & 4 Actions */}
          <div className="card lg:col-span-2">
            <h2 className="text-sm font-semibold text-dark mb-3 uppercase tracking-wide">Actions</h2>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {user?.role !== 'technician' && (
                <Link to="/complaints" className="btn-secondary text-center">
                  View Complaints
                </Link>
              )}
              {user?.role === 'technician' && (
                <Link to="/assignments/my" className="btn-secondary text-center">
                  My Assignments
                </Link>
              )}
              {user?.role === 'student' && (
                <Link to="/complaints/new" className="btn-primary text-center">
                  File New Complaint
                </Link>
              )}
            </div>
          </div>

          {/* Session Info */}
          <div className="card-sage">
            <h2 className="text-sm font-semibold text-dark mb-3 uppercase tracking-wide">Session</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-dark-50 text-xs">Name</dt>
                <dd className="text-dark font-medium">{user?.name}</dd>
              </div>
              <div>
                <dt className="text-dark-50 text-xs">Role</dt>
                <dd>
                  <span className="text-xs bg-sage-300 text-sage-900 px-2 py-0.5 rounded font-medium capitalize">
                    {user?.role}
                  </span>
                </dd>
              </div>
            </dl>
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
            <Route path="/complaints" element={<ComplaintList />} />
            <Route path="/complaints/new" element={<ComplaintForm />} />
            <Route path="/complaints/:id" element={<ComplaintDetails />} />
            <Route path="/assignments/my" element={<TechnicianQueue />} />
          </Route>
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
