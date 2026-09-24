import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, mockInitialUser } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount and verify with /auth/me if online
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('learnlynx_token');
        const storedRefreshToken = localStorage.getItem('learnlynx_refresh_token');
        const storedUser = localStorage.getItem('learnlynx_user');

        if (storedToken) {
          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }

          // Verify with backend
          try {
            const freshUser = await authApi.getCurrentUser();
            if (freshUser) {
              setUser(freshUser);
              localStorage.setItem('learnlynx_user', JSON.stringify(freshUser));
            }
          } catch (e) {
            // Keep storedUser if backend is offline
          }
        }
      } catch (e) {
        console.error('Failed to load session from storage', e);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password, rememberMe = true) => {
    setLoading(true);
    try {
      const { token: receivedToken, refreshToken: receivedRefreshToken, user: receivedUser } = await authApi.login({
        email,
        password,
        rememberMe,
      });

      setToken(receivedToken);
      setRefreshToken(receivedRefreshToken);
      setUser(receivedUser);

      if (rememberMe) {
        localStorage.setItem('learnlynx_token', receivedToken);
        if (receivedRefreshToken) {
          localStorage.setItem('learnlynx_refresh_token', receivedRefreshToken);
        }
        localStorage.setItem('learnlynx_user', JSON.stringify(receivedUser));
      } else {
        sessionStorage.setItem('learnlynx_token', receivedToken);
        if (receivedRefreshToken) {
          sessionStorage.setItem('learnlynx_refresh_token', receivedRefreshToken);
        }
        sessionStorage.setItem('learnlynx_user', JSON.stringify(receivedUser));
      }
      return { success: true, user: receivedUser };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData) => {
    setLoading(true);
    try {
      const { token: receivedToken, refreshToken: receivedRefreshToken, user: receivedUser } = await authApi.signup(formData);
      setToken(receivedToken);
      setRefreshToken(receivedRefreshToken);
      setUser(receivedUser);

      localStorage.setItem('learnlynx_token', receivedToken);
      if (receivedRefreshToken) {
        localStorage.setItem('learnlynx_refresh_token', receivedRefreshToken);
      }
      localStorage.setItem('learnlynx_user', JSON.stringify(receivedUser));

      return { success: true, user: receivedUser };
    } catch (error) {
      return { success: false, message: error.message || 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const currentRefreshToken = refreshToken || localStorage.getItem('learnlynx_refresh_token');
    await authApi.logout(currentRefreshToken);
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('learnlynx_token');
    localStorage.removeItem('learnlynx_refresh_token');
    localStorage.removeItem('learnlynx_user');
    sessionStorage.removeItem('learnlynx_token');
    sessionStorage.removeItem('learnlynx_refresh_token');
    sessionStorage.removeItem('learnlynx_user');
  };

  const updateProfile = async (updates) => {
    try {
      const updatedUser = await authApi.updateProfile(updates);
      setUser(updatedUser);
      localStorage.setItem('learnlynx_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (e) {
      setUser((prev) => {
        const updated = { ...prev, ...updates };
        localStorage.setItem('learnlynx_user', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Quick Demo Login for instant review
  const demoLogin = async () => {
    setLoading(true);
    const demoToken = 'lynx_jwt_demo_access_token';
    const demoRefreshToken = 'lynx_jwt_demo_refresh_token';
    setToken(demoToken);
    setRefreshToken(demoRefreshToken);
    setUser(mockInitialUser);
    localStorage.setItem('learnlynx_token', demoToken);
    localStorage.setItem('learnlynx_refresh_token', demoRefreshToken);
    localStorage.setItem('learnlynx_user', JSON.stringify(mockInitialUser));
    setLoading(false);
    return { success: true, user: mockInitialUser };
  };

  const value = {
    user,
    token,
    refreshToken,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    demoLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
