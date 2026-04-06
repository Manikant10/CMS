import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiConfig from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const storedUser  = localStorage.getItem('bit_cms_user');
      const storedToken = localStorage.getItem('bit_cms_token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem('bit_cms_user');
      localStorage.removeItem('bit_cms_token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, navigate) => {
    try {
      const response = await fetch(apiConfig.endpoints.login, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await response.json();

      if (data.success) {
        const userData = { ...data.user, token: data.token };
        setUser(userData);
        localStorage.setItem('bit_cms_user',  JSON.stringify(userData));
        localStorage.setItem('bit_cms_token', data.token);
        if (navigate) navigate('/dashboard');
        return { success: true };
      }

      return { success: false, message: data.message || 'Login failed' };
    } catch {
      return { success: false, message: 'Cannot reach server. Please try again.' };
    }
  };

  const logout = useCallback((navigate) => {
    setUser(null);
    localStorage.removeItem('bit_cms_user');
    localStorage.removeItem('bit_cms_token');
    if (navigate) navigate('/login');
  }, []);

  /**
   * Authenticated fetch wrapper.
   * Accepts both relative paths ('/api/...') and full URLs.
   * Automatically attaches the Bearer token and handles 401.
   */
  const apiCall = useCallback(async (urlOrPath, options = {}) => {
    const token = localStorage.getItem('bit_cms_token');

    const normalizeAbsoluteUrl = (rawUrl) => {
      try {
        const parsed = new URL(rawUrl);
        parsed.pathname = parsed.pathname.replace(/\/{2,}/g, '/');
        return parsed.toString();
      } catch {
        return rawUrl;
      }
    };

    const resolveUrl = (value) => {
      if (/^https?:\/\//i.test(value)) return normalizeAbsoluteUrl(value);
      const base = (apiConfig.baseURL || '').replace(/\/+$/, '');
      const path = String(value || '').replace(/^\/+/, '');
      return `${base}/${path}`;
    };

    const url = resolveUrl(urlOrPath);

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    // Auto-logout on expired / invalid token
    if (response.status === 401) {
      setUser(null);
      localStorage.removeItem('bit_cms_user');
      localStorage.removeItem('bit_cms_token');
      window.location.href = '/login';
    }

    return response;
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, apiCall }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
