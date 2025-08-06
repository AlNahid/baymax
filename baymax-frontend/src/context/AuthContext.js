import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Checking if any user data exists in local storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    
    if (response.status === 'success' && response.data) {
      const { token, user } = response.data;
      
      authAPI.saveUserData(user, token);
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true, user };
    } else {
      return { 
        success: false, 
        error: response.message || 'Login failed. Please try again.' 
      };
    }
  };

  // Register function
  const register = async (registrationData) => {
    const response = await authAPI.register(registrationData);
    
    if (response.status === 'success' && response.data) {
      const { token, user } = response.data;
      
      authAPI.saveUserData(user, token);
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true, user };
    } else {
      return { 
        success: false, 
        error: response.message || 'Registration failed. Please try again.' 
      };
    }
  };

  // Logout function
  const logout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
