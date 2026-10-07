import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { NotificationPanel } from '../notifications/NotificationUI.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import complaintService from '../complaints/complaintService.js';

// --- Icons ---
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
);

const DocIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, inProgress: 0, resolved: 0, closed: 0 });
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await complaintService.getComplaints({ limit: 100 });
        const data = res.data || [];
        
        const counts = res.pagination?.statusCounts || {};
        setStats({
          total: res.pagination?.total || 0,
          pending: counts.pending || 0,
          assigned: counts.assigned || 0,
          inProgress: counts.in_progress || 0,
          resolved: counts.resolved || 0,
          closed: counts.closed || 0
        });

        setComplaints(data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    };
    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'critical': return 'bg-red-200 text-red-800 font-bold';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F0DE] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#EBEFE2] border-r border-sage-200 flex flex-col z-20 shadow-[2px_0_10px_rgba(0,0,0,0.02)] relative">
        <div className="h-16 flex items-center px-6 border-b border-sage-200 bg-[#FAFAF5]">
          <h1 className="text-[22px] font-bold tracking-tight">
            <span className="text-dark">UniIssue</span>
            <span className="text-sage-700">Hub</span>
          </h1>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 relative">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-[#D3E0C5] text-sage-900 rounded-md font-semibold transition-colors">
            <HomeIcon /> <span className="mt-0.5">Dashboard</span>
          </Link>
          <Link to="/complaints" className="flex items-center gap-3 px-4 py-3 text-sage-800 hover:bg-[#D3E0C5]/50 rounded-md font-medium transition-colors">
            <ListIcon /> <span className="mt-0.5">Complaints</span>
          </Link>
          {user?.role === 'technician' && (
            <Link to="/assignments/my" className="flex items-center gap-3 px-4 py-3 text-sage-800 hover:bg-[#D3E0C5]/50 rounded-md font-medium transition-colors">
              <ListIcon /> <span className="mt-0.5">My Assignments</span>
            </Link>
          )}
          {['admin', 'warden'].includes(user?.role) && (
            <Link to="/analytics" className="flex items-center gap-3 px-4 py-3 text-sage-800 hover:bg-[#D3E0C5]/50 rounded-md font-medium transition-colors">
              <ChartIcon /> <span className="mt-0.5">Analytics</span>
            </Link>
          )}
          
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-sage-800 hover:bg-[#D3E0C5]/50 rounded-md font-medium transition-colors relative"
          >
            <div className="flex items-center gap-3">
              <BellIcon /> <span className="mt-0.5">Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {isNotifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
              <NotificationPanel 
                onClose={() => setIsNotifOpen(false)} 
                className="absolute left-full top-28 ml-2 w-80 z-50 shadow-2xl" 
              />
            </>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 bg-[#FAFAF5] border-b border-sage-200 flex items-center justify-end px-8 gap-6 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#D3E0C5] flex items-center justify-center text-sage-900 font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-dark hidden sm:block">{user?.email}</span>
          </div>
          <button 
            onClick={logout} 
            className="bg-sage-700 hover:bg-sage-800 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Sign Out
          </button>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto relative bg-[#F5F0DE]">
          {/* Faded Background Image Overlay */}
          <div 
            className="absolute top-0 right-0 w-[80%] h-64 bg-cover bg-right mix-blend-multiply opacity-25 pointer-events-none z-0"
            style={{ 
              backgroundImage: 'url(/classroom-bg.jpg)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 80%)',
              maskImage: 'linear-gradient(to right, transparent, black 80%)'
            }}
          />

          <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div>
              <h2 className="text-3xl font-bold text-dark mb-1">Welcome back, {user?.name}</h2>
              <p className="text-sage-700 text-[15px]">You are signed in as a <strong className="capitalize">{user?.role}</strong>.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-white rounded-xl border border-sage-200 p-5 shadow-sm flex flex-col">
                <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center text-sage-700 mb-4">
                  <DocIcon />
                </div>
                <div className="text-3xl font-bold text-dark">{stats.total}</div>
                <div className="text-xs text-dark-50 uppercase tracking-wide font-medium mt-1">Total Complaints</div>
              </div>
              
              <div className="bg-white rounded-xl border border-sage-200 p-5 shadow-sm flex flex-col">
                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 mb-4">
                  <ClockIcon />
                </div>
                <div className="text-3xl font-bold text-dark">{stats.pending}</div>
                <div className="text-xs text-dark-50 uppercase tracking-wide font-medium mt-1">Pending</div>
              </div>
              
              <div className="bg-white rounded-xl border border-sage-200 p-5 shadow-sm flex flex-col">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-700 mb-4"><ListIcon /></div>
                <div className="text-3xl font-bold text-dark">{stats.assigned}</div>
                <div className="text-xs text-dark-50 uppercase tracking-wide font-medium mt-1">Assigned</div>
              </div>

              <div className="bg-white rounded-xl border border-sage-200 p-5 shadow-sm flex flex-col">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-4">
                  <RefreshIcon />
                </div>
                <div className="text-3xl font-bold text-dark">{stats.inProgress}</div>
                <div className="text-xs text-dark-50 uppercase tracking-wide font-medium mt-1">In Progress</div>
              </div>
              
              <div className="bg-white rounded-xl border border-sage-200 p-5 shadow-sm flex flex-col">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-4">
                  <CheckIcon />
                </div>
                <div className="text-3xl font-bold text-dark">{stats.resolved}</div>
                <div className="text-xs text-dark-50 uppercase tracking-wide font-medium mt-1">Resolved</div>
              </div>
              
              <div className="bg-white rounded-xl border border-sage-200 p-5 shadow-sm flex flex-col">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mb-4">
                  <XIcon />
                </div>
                <div className="text-3xl font-bold text-dark">{stats.closed}</div>
                <div className="text-xs text-dark-50 uppercase tracking-wide font-medium mt-1">Closed</div>
              </div>
            </div>

            {/* Main 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Complaints Table */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-sage-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-sage-200 flex justify-between items-center">
                  <h3 className="font-bold text-[17px] text-dark">Recent Complaints</h3>
                  <Link to="/complaints" className="text-sage-700 font-bold text-sm hover:underline flex items-center gap-1 group">
                    View All <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FAFAF5] text-dark font-bold border-b border-sage-200">
                      <tr>
                        <th className="px-5 py-4 w-20">#</th>
                        <th className="px-5 py-4">Title / Category</th>
                        <th className="px-5 py-4">Priority</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Date Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-100">
                      {complaints.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-5 py-8 text-center text-dark-50 font-medium">No recent complaints found.</td>
                        </tr>
                      ) : (
                        complaints.map(c => (
                          <tr key={c._id} className="hover:bg-[#FAFAF5] transition-colors">
                            <td className="px-5 py-4 font-bold text-sage-800">
                              #{c.complaintNumber?.split('-')[1] || c._id.substring(0,6)}
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-semibold text-dark mb-0.5">{c.title}</div>
                              <div className="text-xs text-dark-50 capitalize">{c.category}</div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize ${getPriorityColor(c.priority)}`}>
                                {c.priority}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize ${getStatusColor(c.status)}`}>
                                {c.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-dark-50 font-medium">{formatDate(c.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {complaints.length > 0 && (
                  <div className="p-4 border-t border-sage-200 text-right bg-[#FAFAF5]">
                    <Link to="/complaints" className="text-sage-700 font-bold text-sm hover:underline inline-flex items-center gap-1 group">
                      View All <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Sidebar Area */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-sage-200 p-6 shadow-sm">
                  <h3 className="font-bold text-[17px] text-dark mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link to="/complaints" className="w-full flex items-center justify-between bg-[#EBEFE2] hover:bg-[#D3E0C5] text-sage-900 px-4 py-3 rounded-xl transition-colors group">
                      <div className="flex items-center gap-3 font-semibold text-[15px]">
                        <div className="w-9 h-9 rounded-lg bg-sage-600 text-white flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                          <DocIcon />
                        </div>
                        View Complaints
                      </div>
                      <ArrowRightIcon className="text-sage-600 group-hover:text-sage-900 transition-colors" />
                    </Link>
                    {['admin', 'warden'].includes(user?.role) && (
                      <Link to="/analytics" className="w-full flex items-center justify-between bg-[#EBEFE2] hover:bg-[#D3E0C5] text-sage-900 px-4 py-3 rounded-xl transition-colors group">
                        <div className="flex items-center gap-3 font-semibold text-[15px]">
                          <div className="w-9 h-9 rounded-lg bg-sage-600 text-white flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                            <ChartIcon />
                          </div>
                          View Analytics
                        </div>
                        <ArrowRightIcon className="text-sage-600 group-hover:text-sage-900 transition-colors" />
                      </Link>
                    )}
                    {user?.role === 'student' && (
                      <Link to="/complaints/new" className="w-full flex items-center justify-between bg-[#EBEFE2] hover:bg-[#D3E0C5] text-sage-900 px-4 py-3 rounded-xl transition-colors group">
                        <div className="flex items-center gap-3 font-semibold text-[15px]">
                          <div className="w-9 h-9 rounded-lg bg-sage-600 text-white flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                            <RefreshIcon />
                          </div>
                          File New Complaint
                        </div>
                        <ArrowRightIcon className="text-sage-600 group-hover:text-sage-900 transition-colors" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* My Session */}
                <div className="bg-[#EBEFE2] rounded-xl border border-sage-200 p-6 shadow-sm">
                  <h3 className="font-bold text-[17px] text-dark mb-5">My Session</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-sage-700 font-bold uppercase tracking-wider mb-1">Name</div>
                      <div className="font-bold text-dark text-[15px]">{user?.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-sage-700 font-bold uppercase tracking-wider mb-1">Role</div>
                      <span className="inline-block px-3 py-1 bg-[#D3E0C5] text-sage-900 font-bold text-xs rounded-md capitalize">
                        {user?.role}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs text-sage-700 font-bold uppercase tracking-wider mb-1">Email</div>
                      <div className="font-semibold text-dark-50 text-[14px]">{user?.email}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
