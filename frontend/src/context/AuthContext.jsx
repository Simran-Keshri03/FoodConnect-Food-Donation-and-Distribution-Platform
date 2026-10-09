import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res?.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const authData = res.data;
    setToken(authData.token);
    const userInfo = {
      id: authData.id,
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role,
    };
    setUser(userInfo);
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(userInfo));
    return userInfo;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    const authData = res.data;
    setToken(authData.token);
    const userInfo = {
      id: authData.id,
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role,
    };
    setUser(userInfo);
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(userInfo));
    return userInfo;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        hasRole,
      }}
    >
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
