// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false); // ADDED

  // Login for regular users
  const loginUser = async (emailOrUsername, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', { 
        usernameOrEmail: emailOrUsername,
        password 
      });
      
      if (response.data.success) {
        const { user, tokens, userType } = response.data.data;
        
        await AsyncStorage.setItem('accessToken', tokens.accessToken);
        await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
        await AsyncStorage.setItem('userType', userType);
        
        setUser(user);
        setUserType(userType);
        setIsAuthenticated(true);
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
        
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Login for providers
  const loginProvider = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/provider/login', { email, password });
      
      if (response.data.success) {
        const { provider, tokens, userType } = response.data.data;
        
        await AsyncStorage.setItem('accessToken', tokens.accessToken);
        await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
        await AsyncStorage.setItem('userType', userType);
        
        setProvider(provider);
        setUserType(userType);
        setIsAuthenticated(true);
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
        
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (provider, token) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/social-login', { provider, token });
      
      if (response.data.success) {
        const { user, tokens, userType } = response.data.data;
        
        await AsyncStorage.setItem('accessToken', tokens.accessToken);
        await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
        await AsyncStorage.setItem('userType', userType);
        
        setUser(user);
        setUserType(userType);
        setIsAuthenticated(true);
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
        
        return user;
      }
      
      throw new Error(response.data.message);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Social login failed');
    } finally {
      setLoading(false);
    }
  };

  // Register regular user
  const registerUser = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/register', userData);
      
      if (response.data.success) {
        const { user, tokens, userType } = response.data.data;
        
        await AsyncStorage.setItem('accessToken', tokens.accessToken);
        await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
        await AsyncStorage.setItem('userType', userType);
        
        setUser(user);
        setUserType(userType);
        setIsAuthenticated(true);
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
        
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Register provider
  const registerProvider = async (providerData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/provider/register', providerData);
      
      if (response.data.success) {
        const { provider, tokens, userType } = response.data.data;
        
        await AsyncStorage.setItem('accessToken', tokens.accessToken);
        await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
        await AsyncStorage.setItem('userType', userType);
        
        setProvider(provider);
        setUserType(userType);
        setIsAuthenticated(true);
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
        
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Refresh token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) return null;
      
      const response = await axios.post('/api/auth/refresh', { refreshToken });
      
      if (response.data.success) {
        const { accessToken } = response.data.data;
        await AsyncStorage.setItem('accessToken', accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        return accessToken;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userType');
      
      delete axios.defaults.headers.common['Authorization'];
      
      setUser(null);
      setProvider(null);
      setUserType(null);
      setIsAuthenticated(false);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Logout failed' };
    }
  };

  // Check auth status on app load
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const storedUserType = await AsyncStorage.getItem('userType');
        
        if (accessToken && storedUserType) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          if (storedUserType === 'user') {
            const response = await axios.get('/api/users/profile');
            if (response.data.success) {
              setUser(response.data.data.user);
              setUserType('user');
              setIsAuthenticated(true);
            }
          } else if (storedUserType === 'provider') {
            const response = await axios.get('/api/providers/profile');
            if (response.data.success) {
              setProvider(response.data.data.provider);
              setUserType('provider');
              setIsAuthenticated(true);
            }
          }
        }
      } catch (error) {
        console.error('Load auth error:', error);
        const newToken = await refreshAccessToken();
        if (!newToken) {
          await logout();
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStoredAuth();
  }, []);

  // Interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const newToken = await refreshAccessToken();
          if (newToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const value = {
    user,
    provider,
    userType,
    isLoading,
    isAuthenticated,
    loading,
    loginUser,
    loginProvider,
    registerUser,
    registerProvider,
    logout,
    socialLogin,
    refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};