// src/utils/constants.js

// Search radius defaults
export const DEFAULT_SEARCH_RADIUS_KM = 5;
export const MAX_SEARCH_RADIUS_KM = 50;

// Nairobi city center coordinates (fallback location)
export const NAIROBI_CENTER = {
  lng: 36.8219,
  lat: -1.2921,
};

// Map configuration
export const MAP_CONFIG = {
  INITIAL_ZOOM: 12,
  SEARCH_ZOOM: 14,
  PROVIDER_DETAIL_ZOOM: 16,
};

// API endpoints (relative, base URL from axios defaults)
export const API_ENDPOINTS = {
  // Auth
  LOGIN_USER: '/api/auth/login',
  LOGIN_PROVIDER: '/api/auth/provider/login',
  REGISTER_USER: '/api/auth/register',
  REGISTER_PROVIDER: '/api/auth/provider/register',
  REFRESH_TOKEN: '/api/auth/refresh',
  
  // User
  USER_PROFILE: '/api/users/profile',
  UPDATE_USER_PROFILE: '/api/users/profile',
  UPDATE_USER_RADIUS: '/api/users/radius',
  
  // Provider
  PROVIDER_PROFILE: '/api/providers/profile',
  UPDATE_PROVIDER_PROFILE: '/api/providers/profile',
  UPDATE_PROVIDER_LOCATION: '/api/providers/location',
  TOGGLE_PROVIDER_ACTIVE: '/api/providers/active',
  PROVIDER_ANALYTICS: '/api/providers/analytics',
  
  // Scan
  GET_CLUSTERS: '/api/scan/clusters',
  GET_SERVICES: '/api/scan/services',
  GET_PROVIDER_DETAILS: '/api/scan/provider',
  
  // Categories
  GET_CATEGORIES: '/api/categories',
};

// Error messages
export const ERROR_MESSAGES = {
  LOCATION_PERMISSION_DENIED: 'Location permission denied. Using Nairobi as default location.',
  LOCATION_UNAVAILABLE: 'Unable to get your location. Using Nairobi as default.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  SOMETHING_WRONG: 'Something went wrong. Please try again.',
};

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_TYPE: 'userType',
  USER_DATA: 'userData',
  PROVIDER_DATA: 'providerData',
};

export default {
  DEFAULT_SEARCH_RADIUS_KM,
  MAX_SEARCH_RADIUS_KM,
  NAIROBI_CENTER,
  MAP_CONFIG,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  STORAGE_KEYS,
};