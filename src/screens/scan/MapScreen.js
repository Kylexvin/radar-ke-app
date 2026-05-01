// src/screens/scan/MapScreen.js
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome as Icon } from '@expo/vector-icons';
import ScanHeader from './components/ScanHeader';
import ScanMap from './components/ScanMap';
import ResultsPanel from './components/ResultsPanel';
import CategoryChips from './components/CategoryChips';
import { CATEGORIES, DUMMY_PROVIDERS } from './constants';

const MapScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  
  const [locationStatus, setLocationStatus] = useState('loading');
  const [userCoords, setUserCoords] = useState(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [scanState, setScanState] = useState('idle');
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providers, setProviders] = useState([]);
  const [searchRadius, setSearchRadius] = useState(5);
  const [showRadiusAdjust, setShowRadiusAdjust] = useState(false);
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(false);

  const sheetAnim = useRef(new Animated.Value(0)).current;
  const sonarAnim1 = useRef(new Animated.Value(0)).current;
  const sonarAnim2 = useRef(new Animated.Value(0)).current;
  const sonarAnim3 = useRef(new Animated.Value(0)).current;
  const pinsOpacity = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  const fireSonar = useCallback(() => {
    const pulse = (anim, delay) => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 2200,
        delay,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && scanState === 'scanning') pulse(anim, 0);
      });
    };
    pulse(sonarAnim1, 0);
    pulse(sonarAnim2, 720);
    pulse(sonarAnim3, 1440);
  }, [scanState]);

  const stopSonar = () => {
    sonarAnim1.stopAnimation();
    sonarAnim2.stopAnimation();
    sonarAnim3.stopAnimation();
  };

  const handleScan = useCallback(async (cat) => {
    setActiveCategory(cat);
    setSelectedProvider(null);
    setProviders([]);
    setScanState('scanning');
    setIsSheetCollapsed(false);
    pinsOpacity.setValue(0);
    fireSonar();

    setTimeout(() => {
      stopSonar();
      setProviders(DUMMY_PROVIDERS.filter(p => p.category === cat.id));
      setScanState('results');
      Animated.parallel([
        Animated.timing(pinsOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(sheetAnim, { toValue: 1, tension: 55, friction: 11, useNativeDriver: true }),
      ]).start();
    }, 2200);
  }, [fireSonar]);

  const handleSelectProvider = useCallback((provider) => {
    setSelectedProvider(prev => prev?.id === provider.id ? null : provider);
    mapRef.current?.animateToRegion({
      latitude: provider.coordinates.latitude - 0.005,
      longitude: provider.coordinates.longitude,
      latitudeDelta: 0.022,
      longitudeDelta: 0.022,
    }, 420);
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
  const recenter = useCallback(() => {
    if (!userCoords) return;
    setUserInteracted(false);
    mapRef.current?.animateToRegion({ ...userCoords, latitudeDelta: 0.025, longitudeDelta: 0.025 }, 500);
  }, [userCoords]);

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
        userCoords={userCoords}
        setUserCoords={setUserCoords}
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
        showRadiusAdjust={showRadiusAdjust}
        onToggleRadius={() => setShowRadiusAdjust(p => !p)}
        onRadiusUp={() => adjustRadius(5)}
        onRadiusDown={() => adjustRadius(-5)}
        onClear={clearScan}
        headerOpacity={headerOpacity}
      />

      {userInteracted && locationStatus === 'granted' && (
        <TouchableOpacity
          style={[styles.recenterBtn, { bottom: scanState === 'results' ? 80 : insets.bottom + 100 }]}
          onPress={recenter}
          activeOpacity={0.8}
        >
          <Icon name="crosshairs" size={17} color="#22C55E" />
        </TouchableOpacity>
      )}

      {scanState === 'idle' && (
        <CategoryChips categories={CATEGORIES} onSelectCategory={handleScan} />
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
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  recenterBtn: {
    position: 'absolute',
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(9,9,11,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 25,
  },
});

export default MapScreen;