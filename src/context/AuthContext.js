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
  const [providerProfile, setProviderProfile] = useState(null);
  const [hasProviderProfile, setHasProviderProfile] = useState(false);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get access token from storage
  const getAccessToken = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      return token;
    } catch (error) {
      console.error('Get token error:', error);
      return null;
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
      console.error('Refresh token error:', error);
      return null;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'user',
        'userType',
        'hasProviderProfile',
        'providerProfile'
      ]);
      
      delete axios.defaults.headers.common['Authorization'];
      
      setUser(null);
      setProviderProfile(null);
      setHasProviderProfile(false);
      setUserType(null);
      setIsAuthenticated(false);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Logout failed' };
    }
  };

  // Unified login
  const login = async (usernameOrEmail, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', {
        usernameOrEmail,
        password
      });
      
      if (response.data.success) {
        const { user, tokens, userType, hasProviderProfile, providerProfile } = response.data.data;
        
        // Store everything from login response
        await AsyncStorage.setItem('accessToken', tokens.accessToken);
        await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('userType', userType);
        await AsyncStorage.setItem('hasProviderProfile', JSON.stringify(hasProviderProfile));
        if (providerProfile) {
          await AsyncStorage.setItem('providerProfile', JSON.stringify(providerProfile));
        }
        
        setUser(user);
        setUserType(userType);
        setHasProviderProfile(hasProviderProfile);
        setProviderProfile(providerProfile);
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

  // Register user
  const registerUser = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/register/user', userData);
      
      if (response.data.success) {
        const { user, tokens } = response.data.data;
        
        await AsyncStorage.setItem('accessToken', tokens.accessToken);
        await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('userType', 'user');
        await AsyncStorage.setItem('hasProviderProfile', JSON.stringify(false));
        
        setUser(user);
        setUserType('user');
        setHasProviderProfile(false);
        setProviderProfile(null);
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

  // Become a provider (onboard existing user)
  const onboardAsProvider = async (providerData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/providers/onboard', providerData);
      
      if (response.data.success) {
        const { provider } = response.data.data;
        
        // Update local state
        setHasProviderProfile(true);
        setProviderProfile(provider);
        
        // Update stored provider profile
        await AsyncStorage.setItem('hasProviderProfile', JSON.stringify(true));
        await AsyncStorage.setItem('providerProfile', JSON.stringify(provider));
        
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Onboarding failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Update provider profile
  const updateProviderProfile = async (updates) => {
    try {
      const response = await axios.put('/api/providers/me', updates);
      
      if (response.data.success) {
        const updatedProvider = response.data.data.provider;
        setProviderProfile(updatedProvider);
        await AsyncStorage.setItem('providerProfile', JSON.stringify(updatedProvider));
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed'
      };
    }
  };

  // Toggle provider availability
  const toggleAvailability = async () => {
    try {
      const response = await axios.patch('/api/providers/me/toggle');
      
      if (response.data.success) {
        const updatedProvider = {
          ...providerProfile,
          isActive: response.data.data.isActive
        };
        setProviderProfile(updatedProvider);
        await AsyncStorage.setItem('providerProfile', JSON.stringify(updatedProvider));
        return { success: true, isActive: response.data.data.isActive };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to toggle availability'
      };
    }
  };

  // Load stored auth on app start (NO /me call)
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const storedUser = await AsyncStorage.getItem('user');
        const storedUserType = await AsyncStorage.getItem('userType');
        const storedHasProvider = await AsyncStorage.getItem('hasProviderProfile');
        const storedProviderProfile = await AsyncStorage.getItem('providerProfile');
        
        if (accessToken && storedUser) {
          // Set token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          // Restore state from storage
          setUser(JSON.parse(storedUser));
          setUserType(storedUserType);
          setHasProviderProfile(JSON.parse(storedHasProvider));
          setProviderProfile(storedProviderProfile ? JSON.parse(storedProviderProfile) : null);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Load auth error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStoredAuth();
  }, []);

  // Axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newToken = await refreshAccessToken();
            if (newToken) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return axios(originalRequest);
            } else {
              await logout();
            }
          } catch (refreshError) {
            await logout();
            return Promise.reject(refreshError);
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
    providerProfile,
    hasProviderProfile,
    userType,
    isLoading,
    isAuthenticated,
    loading,
    login,
    registerUser,
    onboardAsProvider,
    updateProviderProfile,
    toggleAvailability,
    logout,
    refreshAccessToken,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};