import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Set axios header + restore user — single effect to avoid race condition
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`);
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (e) {
          console.error('Failed to fetch user:', e);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
