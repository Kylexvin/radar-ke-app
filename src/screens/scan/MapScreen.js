// src/screens/scan/MapScreen.js
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Animated,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome as Icon } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import axios from 'axios';
import ScanHeader from './components/ScanHeader';
import ScanMap from './components/ScanMap';
import ResultsPanel from './components/ResultsPanel';
import CategoryChips from './components/CategoryChips';
import CategoryBrowserModal from './components/CategoryBrowserModal';
import { useAuth } from '../../context/AuthContext';

const MapScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const { getAccessToken } = useAuth();
  const hasFetchedCategories = useRef(false);

  // Stable ref for userCoords — prevents stale closures in callbacks
  const userCoordsRef = useRef(null);

  const [locationStatus, setLocationStatus] = useState('loading'); // loading | granted | denied | error | unavailable
  const [userCoords, setUserCoords] = useState(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [scanState, setScanState] = useState('idle');
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchRadius, setSearchRadius] = useState(5);
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCategoryBrowser, setShowCategoryBrowser] = useState(false);
  const [showRecenterHint, setShowRecenterHint] = useState(false);

  const [toastMsg, setToastMsg] = useState('');
  const toastAnim = useRef(new Animated.Value(0)).current;
  const hintAnim = useRef(new Animated.Value(0)).current;

  const sheetAnim = useRef(new Animated.Value(0)).current;
  const sonarAnim1 = useRef(new Animated.Value(0)).current;
  const sonarAnim2 = useRef(new Animated.Value(0)).current;
  const sonarAnim3 = useRef(new Animated.Value(0)).current;
  const pinsOpacity = useRef(new Animated.Value(0)).current;

  // Stable coord updater — always keeps ref in sync
  const updateUserCoords = useCallback((coords) => {
    userCoordsRef.current = coords;
    setUserCoords(coords);
  }, []);

  // Get user location on mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Fetch categories when location is available (only once)
  useEffect(() => {
    if (userCoords && !hasFetchedCategories.current) {
      hasFetchedCategories.current = true;
      fetchCategoriesPresence();
    }
  }, [userCoords]);

  // Show hint when location is first granted
  useEffect(() => {
    if (locationStatus === 'granted' && userCoords) {
      setShowRecenterHint(true);
      hintAnim.setValue(0);
      Animated.sequence([
        Animated.timing(hintAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(2800),
        Animated.timing(hintAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setShowRecenterHint(false));
    }
  }, [locationStatus]);

  const requestLocationPermission = async () => {
    try {
      setLocationStatus('loading');
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        // canAskAgain = false means user permanently denied → must go to Settings
        setLocationStatus(canAskAgain ? 'denied' : 'unavailable');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      updateUserCoords(coords);
      setLocationStatus('granted');

      // Auto-fly to user on first grant
      setTimeout(() => {
        mapRef.current?.animateToRegion(
          { ...coords, latitudeDelta: 0.025, longitudeDelta: 0.025 },
          800
        );
      }, 400);
    } catch (error) {
      console.error('Location error:', error);
      setLocationStatus('error');
    }
  };

  const openAppSettings = () => {
    Linking.openSettings();
  };

  const fetchCategoriesPresence = async () => {
    try {
      setLoadingCategories(true);
      const token = await getAccessToken();
      const response = await axios.get('/api/scan/categories/presence', {
        params: {
          lng: userCoordsRef.current.longitude,
          lat: userCoordsRef.current.latitude,
          radiusKm: searchRadius,
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.data.success) {
        const { categories: backendCategories } = response.data.data;
        const transformedCategories = backendCategories
          .filter(cat => cat && cat.id)
          .map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            iconName: cat.iconName,
            color: cat.color,
            count: cat.count,
            hasProviders: cat.hasProviders,
          }));
        setCategories(transformedCategories);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
      showToast('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [toastAnim]);

  const fireSonar = useCallback(() => {
    const pulse = (anim, delay) => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 2200,
        delay,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) pulse(anim, 0);
      });
    };
    pulse(sonarAnim1, 0);
    pulse(sonarAnim2, 720);
    pulse(sonarAnim3, 1440);
  }, []);

  const stopSonar = () => {
    sonarAnim1.stopAnimation();
    sonarAnim2.stopAnimation();
    sonarAnim3.stopAnimation();
  };

  const handleScan = useCallback(async (category) => {
    if (!category || !category.slug) {
      console.error('Invalid category in handleScan:', category);
      showToast('Invalid category selected');
      return;
    }

    const hasCustomOrigin = mapRef.current?.hasCustomOrigin?.() || false;
    // Use ref to avoid stale closure
    let scanOrigin = userCoordsRef.current;

    if (hasCustomOrigin) {
      const customOrigin = mapRef.current?.getCustomOrigin?.();
      if (customOrigin) {
        scanOrigin = customOrigin;
      }
    }

    if (!scanOrigin) {
      showToast('Waiting for location...');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveCategory(category);
    setSelectedProvider(null);
    setProviders([]);
    setScanState('scanning');
    setIsSheetCollapsed(false);
    pinsOpacity.setValue(0);

    await mapRef.current?.refreshUserPosition();
    fireSonar();

    try {
      const token = await getAccessToken();
      const response = await axios.get('/api/scan/providers', {
        params: {
          lng: scanOrigin.longitude,
          lat: scanOrigin.latitude,
          category: category.slug,
          radiusKm: searchRadius,
          limit: 50,
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setTimeout(() => {
        stopSonar();

        if (response.data.success) {
          const apiProviders = response.data.data.providers;
const transformedProviders = apiProviders.map(provider => ({
  id: provider.id,
  name: provider.name,
  phone: provider.phone,
  whatsapp: provider.whatsapp,
  description: provider.description,
  locationAddress: provider.locationAddress,
  address: provider.locationAddress,
  distance: provider.distance ? `${provider.distance.toFixed(1)}km` : '0km',
  radiusKm: provider.radiusKm,
  rating: provider.rating || 4.5,
  isVerified: provider.isVerified || false,
  isActive: provider.isActive !== undefined ? provider.isActive : true,
  category: category.slug,
  categoryName: category.name,
  color: category.color,
  icon: category.iconName,
  coordinates: {
    latitude: provider.location.coordinates[1],
    longitude: provider.location.coordinates[0],
  },
  capabilities: provider.capabilities ?? {   // ← add this
    canBeContacted: true,
    hasShowcase: false,
    hasShop: false,
    takesBookings: false,
  },
}));

          setProviders(transformedProviders);
          setScanState('results');
          Animated.parallel([
            Animated.timing(pinsOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
            Animated.spring(sheetAnim, { toValue: 1, tension: 55, friction: 11, useNativeDriver: true }),
          ]).start();

          if (transformedProviders.length > 0) {
            const originText = hasCustomOrigin ? 'near custom location' : 'near you';
            showToast(`${transformedProviders.length} ${category.name} provider${transformedProviders.length > 1 ? 's' : ''} found ${originText}`);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            showToast(`No ${category.name} providers nearby`);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        } else {
          showToast('Scan failed. Please try again');
          setScanState('idle');
        }
      }, 2200);
    } catch (error) {
      console.error('Scan error:', error);
      stopSonar();
      showToast('Network error. Please try again');
      setScanState('idle');
    }
  }, [searchRadius, fireSonar, showToast, getAccessToken]);

  const handleSelectProvider = useCallback((provider) => {
    Haptics.selectionAsync();
    setSelectedProvider(prev => prev?.id === provider.id ? null : provider);
    if (provider.coordinates) {
      mapRef.current?.animateToRegion({
        latitude: provider.coordinates.latitude - 0.005,
        longitude: provider.coordinates.longitude,
        latitudeDelta: 0.022,
        longitudeDelta: 0.022,
      }, 420);
    }
  }, []);

  const clearScan = useCallback(() => {
    stopSonar();
    setScanState('idle');
    setActiveCategory(null);
    setSelectedProvider(null);
    setProviders([]);
    setIsSheetCollapsed(false);
    pinsOpacity.setValue(0);
    Animated.timing(sheetAnim, { toValue: 0, duration: 260, useNativeDriver: true }).start();
  }, []);

  const toggleSheetCollapse = useCallback(() => {
    const targetValue = isSheetCollapsed ? 1 : 0.3;
    Animated.spring(sheetAnim, { toValue: targetValue, tension: 65, friction: 12, useNativeDriver: true }).start();
    setIsSheetCollapsed(!isSheetCollapsed);
  }, [isSheetCollapsed]);

  const adjustRadius = (delta) => setSearchRadius(prev => Math.min(50, Math.max(1, prev + delta)));

  // Uses ref — no stale coords ever
  const recenter = useCallback(() => {
    const coords = userCoordsRef.current;
    if (!coords) return;
    setUserInteracted(false);
    mapRef.current?.animateToRegion(
      { ...coords, latitudeDelta: 0.025, longitudeDelta: 0.025 },
      500
    );
  }, []);

  const handleMapPress = useCallback(() => {
    if (scanState === 'results' && !isSheetCollapsed) {
      toggleSheetCollapse();
    }
  }, [scanState, isSheetCollapsed, toggleSheetCollapse]);

  const toastTranslateY = toastAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] });

  // Overlay for denied/error/unavailable states
  const renderLocationOverlay = () => {
    if (locationStatus === 'granted' || locationStatus === 'loading') return null;

    const isDenied = locationStatus === 'denied';
    const isUnavailable = locationStatus === 'unavailable';
    const isError = locationStatus === 'error';

    const icon = isUnavailable ? 'ban' : isError ? 'exclamation-triangle' : 'map-marker';
    const iconColor = isError ? '#EF4444' : '#EAB308';
    const title = isUnavailable
      ? 'Location Access Blocked'
      : isError
      ? 'Location Error'
      : 'Location Permission Needed';
    const message = isUnavailable
      ? 'You permanently denied location access. Open Settings to enable it for Rada Ke.'
      : isError
      ? 'Could not determine your location. Please try again.'
      : 'Rada Ke needs your location to find nearby services.';
    const btnLabel = isUnavailable ? 'Open Settings' : 'Try Again';
    const btnAction = isUnavailable ? openAppSettings : requestLocationPermission;

    return (
      <View style={styles.locationOverlay}>
        <View style={styles.locationCard}>
          <View style={[styles.locationIconWrap, { borderColor: iconColor + '40' }]}>
            <Icon name={icon} size={26} color={iconColor} />
          </View>
          <Text style={styles.locationTitle}>{title}</Text>
          <Text style={styles.locationMessage}>{message}</Text>
          <TouchableOpacity
            style={[styles.locationBtn, { borderColor: iconColor + '50', backgroundColor: iconColor + '18' }]}
            onPress={btnAction}
            activeOpacity={0.75}
          >
            <Icon name={isUnavailable ? 'cog' : 'refresh'} size={13} color={iconColor} />
            <Text style={[styles.locationBtnText, { color: iconColor }]}>{btnLabel}</Text>
          </TouchableOpacity>
          {isDenied && (
            <TouchableOpacity onPress={openAppSettings} style={styles.locationSettingsLink}>
              <Text style={styles.locationSettingsLinkText}>Or open Settings manually</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScanMap
        ref={mapRef}
        searchRadius={searchRadius}
        scanState={scanState}
        activeCategory={activeCategory}
        providers={providers}
        selectedProvider={selectedProvider}
        onSelectProvider={handleSelectProvider}
        onMapInteraction={() => setUserInteracted(true)}
        onMapPress={handleMapPress}
        userCoords={userCoords}
        setUserCoords={updateUserCoords}
        locationStatus={locationStatus}
        setLocationStatus={setLocationStatus}
        sonarAnim1={sonarAnim1}
        sonarAnim2={sonarAnim2}
        sonarAnim3={sonarAnim3}
        pinsOpacity={pinsOpacity}
      />

      <ScanHeader
        scanState={scanState}
        activeCategory={activeCategory}
        searchRadius={searchRadius}
        onRadiusUp={() => adjustRadius(5)}
        onRadiusDown={() => adjustRadius(-5)}
        onClear={clearScan}
        providers={providers}
        categories={categories}
        onOpenCategoryBrowser={() => setShowCategoryBrowser(true)}
      />

      <CategoryBrowserModal
        visible={showCategoryBrowser}
        categories={categories}
        onClose={() => setShowCategoryBrowser(false)}
        onSelectCategory={(category) => {
          handleScan(category);
        }}
        userCoords={userCoords}
      />

      {/* Toast */}
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: toastAnim,
            transform: [{ translateY: toastTranslateY }],
            top: insets.top + 130,
          },
        ]}
        pointerEvents="none"
      >
        <Icon name="map-marker" size={11} color="#22C55E" />
        <Text style={styles.toastText}>{toastMsg}</Text>
      </Animated.View>

      {/* Recenter button — always visible when location is granted */}
      {locationStatus === 'granted' && (
        <View style={[styles.recenterGroup, { bottom: scanState === 'results' ? 80 : insets.bottom + 100 }]}>
          {/* Hint tooltip */}
          {showRecenterHint && (
            <Animated.View
              style={[styles.recenterHint, { opacity: hintAnim }]}
              pointerEvents="none"
            >
              <Text style={styles.recenterHintText}>Tap to go to your location</Text>
              <View style={styles.recenterHintArrow} />
            </Animated.View>
          )}
          <TouchableOpacity
            style={[
              styles.recenterBtn,
              !userInteracted && styles.recenterBtnActive,
            ]}
            onPress={recenter}
            activeOpacity={0.8}
          >
            <Icon
              name="crosshairs"
              size={17}
              color={userInteracted ? 'rgba(34,197,94,0.55)' : '#22C55E'}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Location permission/error overlay */}
      {renderLocationOverlay()}

      {scanState === 'idle' && !loadingCategories && categories.length > 0 && (
        <CategoryChips
          categories={categories}
          onSelectCategory={(category) => {
            if (category && category.slug) {
              handleScan(category);
            }
          }}
        />
      )}

      {(scanState === 'results' || scanState === 'scanning') && (
        <ResultsPanel
          scanState={scanState}
          activeCategory={activeCategory}
          providers={providers}
          selectedProvider={selectedProvider}
          onSelectProvider={handleSelectProvider}
          onClearScan={clearScan}
          isSheetCollapsed={isSheetCollapsed}
          onToggleCollapse={toggleSheetCollapse}
          sheetAnim={sheetAnim}
          navigation={navigation}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },

  recenterGroup: {
    position: 'absolute',
    right: 14,
    alignItems: 'flex-end',
    zIndex: 25,
  },
  recenterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(9,9,11,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recenterBtnActive: {
    borderColor: 'rgba(34,197,94,0.45)',
    backgroundColor: 'rgba(34,197,94,0.08)',
  },
  recenterHint: {
    position: 'absolute',
    right: 48,
    bottom: 6,
    backgroundColor: 'rgba(9,9,11,0.93)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    zIndex: 26,
    minWidth: 170,
  },
  recenterHintText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    textAlign: 'center',
  },
  recenterHintArrow: {
    position: 'absolute',
    right: -5,
    top: '50%',
    marginTop: -4,
    width: 0,
    height: 0,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 5,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'rgba(34,197,94,0.3)',
  },

  toast: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(9,9,11,0.93)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.22)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 40,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.2,
  },

  // Location overlay
  locationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,8,10,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  locationCard: {
    width: '78%',
    backgroundColor: 'rgba(14,14,18,0.97)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 12,
  },
  locationIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  locationMessage: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 19,
    letterSpacing: 0.1,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 16,
    borderWidth: 1,
  },
  locationBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  locationSettingsLink: {
    marginTop: 2,
    paddingVertical: 4,
  },
  locationSettingsLinkText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.28)',
    textDecorationLine: 'underline',
  },
});

export default MapScreen;