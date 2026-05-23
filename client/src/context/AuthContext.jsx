import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('orbit_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('orbit_token');
    if (!token) { setLoading(false); return; }

    api.get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('orbit_token');
        localStorage.removeItem('orbit_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const saveUser = (token, userData) => {
    localStorage.setItem('orbit_token', token);
    localStorage.setItem('orbit_user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = useCallback(async ({ name, email, password, role }) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    saveUser(res.data.token, res.data.user);
    toast.success(`Welcome to Orbit, ${res.data.user.name}! 🚀`);
    return res.data;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res = await api.post('/auth/login', { email, password });
    saveUser(res.data.token, res.data.user);
    toast.success(`Welcome back, ${res.data.user.name}!`);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('orbit_token');
    localStorage.removeItem('orbit_user');
    setUser(null);
    toast('Logged out', { icon: '👋' });
  }, []);

  const updateUser = useCallback(async (data) => {
    const res = await api.put('/auth/me', data);
    const updated = res.data.user;
    localStorage.setItem('orbit_user', JSON.stringify(updated));
    setUser(updated);
    toast.success('Profile updated!');
    return updated;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
