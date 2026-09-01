import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, loginUser, registerUser } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('websitescout_token'));
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    async function checkAuth() {
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data.user);
        } catch (err) {
          console.warn('Token expired or invalid:', err.message);
          localStorage.removeItem('websitescout_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    if (res.data.success) {
      localStorage.setItem('websitescout_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthModalOpen(false);
      return res.data.user;
    }
  };

  const register = async (name, email, password, agencyName) => {
    const res = await registerUser({ name, email, password, agencyName });
    if (res.data.success) {
      localStorage.setItem('websitescout_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthModalOpen(false);
      return res.data.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('websitescout_token');
    setToken(null);
    setUser(null);
  };

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthModalOpen,
        authMode,
        openAuthModal,
        closeAuthModal,
        setAuthMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
