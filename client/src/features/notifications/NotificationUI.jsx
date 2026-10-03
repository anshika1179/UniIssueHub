import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';

export const NotificationPanel = ({ onClose, className = "absolute top-12 right-0 w-80" }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket, unreadCount, setUnreadCount } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();

    if (socket) {
      const handleNewNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
      };
      socket.on('notification:new', handleNewNotification);
      return () => {
        socket.off('notification:new', handleNewNotification);
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=20');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id, complaintId) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      if (complaintId) {
        onClose();
        navigate(`/complaints/${complaintId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`${className} bg-white border border-sage-300 rounded-md shadow-lg z-50 overflow-hidden flex flex-col max-h-96`}>
      <div className="flex justify-between items-center p-3 bg-sage-50 border-b border-sage-200">
        <h3 className="font-semibold text-dark text-sm">Notifications</h3>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-xs text-sage-700 hover:text-sage-900">
            Mark all read
          </button>
        )}
      </div>
      <div className="overflow-y-auto flex-1 p-2">
        {loading ? (
          <p className="text-sm text-center p-4 text-dark-50">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-center p-4 text-dark-50">No notifications.</p>
        ) : (
          notifications.map(n => (
            <div 
              key={n._id} 
              onClick={() => markAsRead(n._id, n.complaintId)}
              className={`p-3 border-b border-sage-100 last:border-0 rounded mb-1 cursor-pointer transition-colors ${n.isRead ? 'bg-white hover:bg-cream-50' : 'bg-cream hover:bg-cream-100'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-sm text-dark">{n.title}</span>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-sage-600 mt-1 flex-shrink-0"></span>}
              </div>
              <p className="text-xs text-dark-50 line-clamp-2">{n.message}</p>
              <p className="text-[10px] text-sage-500 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useSocket();

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-sage-100 hover:bg-sage-200 flex items-center justify-center transition-colors relative"
      >
        <span className="text-sage-700 font-medium">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="relative z-50">
            <NotificationPanel onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
};
