// src/hooks/useLocation.js
import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { NAIROBI_CENTER, ERROR_MESSAGES } from '../utils/constants';
import { Alert, Platform } from 'react-native';

export const useLocation = () => {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const refreshLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check current permission status
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      let finalStatus = existingStatus;
      
      // If permission not granted, request it
      if (existingStatus !== 'granted') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      // Handle permission response
      if (finalStatus !== 'granted') {
        const errorMsg = ERROR_MESSAGES.LOCATION_PERMISSION_DENIED;
        setError(errorMsg);
        setPermissionGranted(false);
        // Use Nairobi center as fallback
        setCoords(NAIROBI_CENTER);
        
        // Show alert only once to avoid spam
        if (Platform.OS !== 'web') {
          Alert.alert('Location Access', errorMsg);
        }
        setLoading(false);
        return;
      }

      // Permission granted, get current location
      setPermissionGranted(true);
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setCoords({
        lat: latitude,
        lng: longitude,
      });
      
    } catch (err) {
      console.error('Location error:', err);
      const errorMsg = ERROR_MESSAGES.LOCATION_UNAVAILABLE;
      setError(errorMsg);
      setPermissionGranted(false);
      // Use Nairobi center as fallback
      setCoords(NAIROBI_CENTER);
      
      if (Platform.OS !== 'web') {
        Alert.alert('Location Error', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Request location on mount
  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  return {
    coords,        // { lat, lng } or null if loading, or NAIROBI_CENTER if permission denied
    loading,       // boolean - true while fetching location
    error,         // string - error message if any
    permissionGranted, // boolean - true if user granted permission
    refreshLocation,   // function - manually refresh location
  };
};

export default useLocation;