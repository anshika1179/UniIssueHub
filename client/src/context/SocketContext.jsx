import { useState, useEffect, createContext, useContext } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Connect only after login (and reconnect on re-login)
    if (!isAuthenticated) return undefined;

    // Only connect if we have a token cookie
    // We check via api to get unread count, if it fails (401), we don't connect
    let newSocket;

    const init = async () => {
      try {
        const { count } = await api.get('/notifications/unread-count');
        setUnreadCount(count);

        newSocket = io(api.defaults.baseURL.replace('/api/v1', ''), {
          withCredentials: true,
          autoConnect: true
        });

        newSocket.on('notification:new', (notification) => {
          setUnreadCount(prev => prev + 1);
          // could dispatch a toast here
        });

        setSocket(newSocket);
      } catch (err) {
        // Not authenticated or server down
      }
    };

    init();

    return () => {
      if (newSocket) newSocket.disconnect();
      setSocket(null);
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};
