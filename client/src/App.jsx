import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './features/auth/Login.jsx';
import Register from './features/auth/Register.jsx';
import PolicyPage from './pages/PolicyPage.jsx';
import LandingPage from './features/landing/LandingPage.jsx';
import ComplaintList from './features/complaints/ComplaintList.jsx';
import ComplaintForm from './features/complaints/ComplaintForm.jsx';
import ComplaintDetails from './features/complaints/ComplaintDetails.jsx';
import TechnicianQueue from './features/complaints/TechnicianQueue.jsx';
import { NotificationBell } from './features/notifications/NotificationUI.jsx';
import AnalyticsDashboard from './features/analytics/AnalyticsDashboard.jsx';

import Dashboard from './features/dashboard/Dashboard.jsx';


// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/terms" element={<PolicyPage type="terms" />} />
            <Route path="/privacy" element={<PolicyPage type="privacy" />} />
            <Route path="/landing" element={<Navigate to="/" replace />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/complaints" element={<ComplaintList />} />
              <Route path="/complaints/new" element={<ComplaintForm />} />
              <Route path="/complaints/:id" element={<ComplaintDetails />} />
              <Route element={<ProtectedRoute allowedRoles={['technician']} />}>
                <Route path="/assignments/my" element={<TechnicianQueue />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['admin', 'warden']} />}>
                <Route path="/analytics" element={<AnalyticsDashboard />} />
              </Route>
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
