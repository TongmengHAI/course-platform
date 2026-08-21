import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Read initial user from localStorage for persistent login across page refreshes
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // Login handler: POST /auth/login
  const login = async (phone, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { phone, password });
      
      // Backend response shape: { message: "...", data: { id, username, phone, role }, token: "..." }
      const token = response.token;
      const authenticatedUser = response.data;
      const refreshToken = response.refreshToken;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      
      setUser(authenticatedUser);
      return authenticatedUser;
    } finally {
      setLoading(false);
    }
  };

  // Register handler: POST /auth/register
  const register = async (username, phone, email, password, role = 'student') => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { username, phone, email, password, role });
      return response;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {

    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        // Invalidate the token on the backend
        await api.post('/auth/logout', { refreshToken });
      } catch (err) {
        console.error("Logout request failed:", err);
      }
    }

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);