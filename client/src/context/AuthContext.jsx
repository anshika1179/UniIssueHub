import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore session on app startup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // api interceptor unwraps response.data, so res = { success, data: { user } }
        const res = await api.get('/auth/me');
        if (res.success && res.data?.user) {
          setUser(res.data.user);
          setIsAuthenticated(true);
        }
      } catch {
        // 401 — no session, that's fine
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    // Throws on error (axios interceptor rejects non-2xx)
    const res = await api.post('/auth/login', credentials);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      setIsAuthenticated(true);
    }
    return res;
  };

  const googleLogin = async (credential) => {
    const res = await api.post('/auth/google', typeof credential === 'string' ? { credential } : credential);
    if (!res.success || !res.data?.user) {
      throw new Error(res.message || 'Google sign-in failed.');
    }
    setUser(res.data.user);
    setIsAuthenticated(true);
    return res;
  };

  const register = async (data) => {
    return await api.post('/auth/register', data);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout'); // POST — clears cookie
    } catch {
      // ignore network errors
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, googleLogin, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
