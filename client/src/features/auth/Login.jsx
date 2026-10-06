import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// Demo credentials already used by server/test-phase4.js and later phase tests.
// The selector only fills the form; the server still authenticates the account.
const DEMO_ACCOUNTS = {
  admin: { label: 'Admin', email: 'admin_p4@uni.com', password: 'Secure123!' },
  technician: { label: 'Technician', email: 'tech_p4@uni.com', password: 'Secure123!' },
  warden: { label: 'Warden', email: 'warden_p4@uni.com', password: 'Secure123!' },
  student: { label: 'Student', email: 'bob@uni.com', password: 'Secure123!' },
};

// Inline Icons
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    const account = DEMO_ACCOUNTS[role];
    setSelectedRole(role);
    setForm(account ? { email: account.email, password: account.password } : { email: '', password: '' });
    setShowPassword(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('Google login is not yet configured in this environment.');
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex items-center justify-center p-4">
      {/* Blurred Background Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center blur-sm transform scale-105"
        style={{ backgroundImage: 'url(/classroom-bg.jpg)' }}
      />
      {/* Subtle overlay to enhance text readability */}
      <div className="absolute inset-0 bg-white/10" />

      <div className="relative w-full max-w-[480px] z-10 my-8">
        
        {/* Card */}
        <div className="bg-[#f8f5eb] rounded-2xl shadow-2xl border-2 border-sage-800 p-8 sm:p-10 w-full text-dark">
          {/* Brand */}
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-sage-900 tracking-tight flex items-center justify-center sm:justify-start gap-1">
              <span className="text-sage-900">UniIssue</span>
              <span className="text-sage-600">Hub</span>
            </h1>
            <p className="text-sm text-sage-700 mt-1 font-medium">Smart Campus Complaint Management</p>
          </div>

          <h2 className="text-3xl font-bold text-dark mb-6">Welcome back</h2>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="demo-role" className="block text-sm font-bold text-dark mb-1.5">
                Role
              </label>
              <select
                id="demo-role"
                name="demo-role"
                value={selectedRole}
                onChange={handleRoleChange}
                disabled={loading}
                className="w-full px-3 py-3 rounded-lg border border-sage-300 bg-[#f8f5eb] text-dark focus:outline-none focus:ring-2 focus:ring-sage-600 focus:bg-white transition-colors duration-200 disabled:opacity-70"
              >
                <option value="">Use my own account</option>
                {Object.entries(DEMO_ACCOUNTS).map(([role, account]) => (
                  <option key={role} value={role}>{account.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-dark mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sage-600">
                  <MailIcon />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-sage-300 bg-transparent text-dark placeholder-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-600 focus:bg-white transition-colors duration-200"
                  placeholder="Enter your university email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-dark mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sage-600">
                  <LockIcon />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-sage-300 bg-transparent text-dark placeholder-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-600 focus:bg-white transition-colors duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sage-600 hover:text-sage-800 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-sage-800 focus:ring-sage-800 border-sage-400 rounded bg-transparent"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-dark">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-bold text-sage-800 hover:text-sage-900 hover:underline">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sage-800 text-white px-6 py-3.5 rounded-lg font-bold hover:bg-sage-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-800 focus:ring-offset-2 focus:ring-offset-cream flex justify-center items-center mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In \u2192'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center space-x-2">
            <span className="h-px bg-sage-300 w-full"></span>
            <span className="text-xs text-sage-500 font-bold uppercase tracking-wider">OR</span>
            <span className="h-px bg-sage-300 w-full"></span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full mt-6 bg-white border border-sage-300 text-dark px-6 py-3.5 rounded-lg font-bold hover:bg-sage-50 transition-colors duration-200 flex justify-center items-center gap-3 focus:outline-none focus:ring-2 focus:ring-sage-600 focus:ring-offset-2 focus:ring-offset-cream"
          >
            <GoogleIcon />
            Continue with Google
          </button>
          
          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-dark-50">
              New to UniIssueHub?{' '}
              <Link to="/register" className="text-sage-800 font-bold hover:underline transition-colors hover:text-sage-900">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
