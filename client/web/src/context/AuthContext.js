
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token and user in localStorage on mount
    const storedUser = localStorage.getItem('bit_cms_user');
    const storedToken = localStorage.getItem('bit_cms_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, navigate) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.success) {
        const userData = { ...data.user, token: data.token };
        setUser(userData);
        localStorage.setItem('bit_cms_user', JSON.stringify(userData));
        localStorage.setItem('bit_cms_token', data.token);
        
        // Redirect to dashboard after successful login
        if (navigate) {
          navigate('/dashboard');
        }
        
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error connection failed' };
    }
  };

  const logout = (navigate) => {
    setUser(null);
    localStorage.removeItem('bit_cms_user');
    localStorage.removeItem('bit_cms_token');
    
    // Redirect to login page after logout
    if (navigate) {
      navigate('/login');
    }
  };

  // Helper function to make authenticated API calls
  const apiCall = async (url, options = {}) => {
    const token = localStorage.getItem('bit_cms_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    // Use absolute URL for API calls
    const baseUrl = window.location.origin;
    const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : url;

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    return response;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, apiCall }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
