import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mospi_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('mospi_token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync token to API headers & check /api/auth/me on mount/refresh
  useEffect(() => {
    if (token) {
      setAuthToken(token);
      if (user?.id) {
        api.defaults.headers.common['x-user-id'] = user.id;
      }
      // Re-check /api/auth/me to verify user role
      api.get('/api/auth/me')
        .then((res) => {
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('mospi_user', JSON.stringify(res.data.user));
          }
        })
        .catch((err) => {
          console.warn('Auth /me sync check failed or using local state:', err?.message);
        });
    }
  }, []);

  // 5-Minute Inactivity Auto-Logout Effect
  useEffect(() => {
    if (!token && !user) return;

    let inactivityTimer;
    const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // 5 Minutes (300,000ms)

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        logout();
      }, INACTIVITY_LIMIT_MS);
    };

    resetTimer();

    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart', 'click'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [token, user]);

  const saveAuth = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    setAuthToken(authToken);
    if (userData?.id) {
      api.defaults.headers.common['x-user-id'] = userData.id;
    }
    localStorage.setItem('mospi_token', authToken);
    localStorage.setItem('mospi_user', JSON.stringify(userData));
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token: authToken, user: userData } = response.data;

      saveAuth(authToken, userData);
      setLoading(false);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password.';
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  };

  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: formData.fullName || formData.name,
        email: formData.email,
        password: formData.password,
        designation: formData.designation,
        department: formData.department,
        division: formData.division || '',
        experience: formData.experience || '0',
        role: (formData.role || 'cso').toLowerCase(),
      };
      const response = await api.post('/api/auth/register', payload);
      const { token: authToken, user: userData } = response.data;

      saveAuth(authToken, userData);
      setLoading(false);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    delete api.defaults.headers.common['x-user-id'];
    localStorage.removeItem('mospi_token');
    localStorage.removeItem('mospi_user');
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
