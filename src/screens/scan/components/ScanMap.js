// src/screens/scan/components/ScanMap.js
import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { FontAwesome as Icon } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const NAIROBI = {
  latitude: -1.2921,
  longitude: 36.8219,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0e0e10' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#3a3a3a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0e0e10' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a1e' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#1e1e24' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#242430' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#18181e' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#333340' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#080c12' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#111116' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0f1410' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#131316' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#1c1c22' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
];

const SonarPing = ({ anim, color = '#22C55E', size }) => {
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.05, 1] });
  const opacity = anim.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0.65, 0.25, 0] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: color,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
};

const ScanMap = forwardRef(({
  searchRadius,
  scanState,
  activeCategory,
  providers,
  selectedProvider,
  onSelectProvider,
  onMapInteraction,
  onMapPress,
  userCoords,
  setUserCoords,
  locationStatus,
  setLocationStatus,
  sonarAnim1,
  sonarAnim2,
  sonarAnim3,
  pinsOpacity,
}, ref) => {
  const mapRef = useRef(null);
  const [userScreenPos, setUserScreenPos] = useState(null);
  const [customScreenPos, setCustomScreenPos] = useState(null);
  const lastUserScreenPos = useRef(null);
  const lastCustomScreenPos = useRef(null);
  
  const [customOrigin, setCustomOrigin] = useState(null);
  const customOriginAnim = useRef(new Animated.Value(0)).current;

  const SONAR_SIZE = width * 0.72;
  const scanOrigin = customOrigin || userCoords;
  
  // Select correct screen position based on origin type
  const sonarPos = customOrigin 
    ? (customScreenPos || lastCustomScreenPos.current) 
    : (userScreenPos || lastUserScreenPos.current);

  // Update user location screen position
  const updateUserScreenPosition = useCallback(async () => {
    if (!mapRef.current || !userCoords) return;
    try {
      const point = await mapRef.current.pointForCoordinate(userCoords);
      if (point) {
        setUserScreenPos({ x: point.x, y: point.y });
        lastUserScreenPos.current = { x: point.x, y: point.y };
      }
    } catch (error) {
      const fallback = { x: width / 2, y: height / 2 };
      setUserScreenPos(fallback);
      lastUserScreenPos.current = fallback;
    }
  }, [userCoords]);

  // Update custom origin screen position
  const updateCustomScreenPosition = useCallback(async () => {
    if (!mapRef.current || !customOrigin) return;
    try {
      const point = await mapRef.current.pointForCoordinate(customOrigin);
      if (point) {
        setCustomScreenPos({ x: point.x, y: point.y });
        lastCustomScreenPos.current = { x: point.x, y: point.y };
      }
    } catch (error) {
      const fallback = { x: width / 2, y: height / 2 };
      setCustomScreenPos(fallback);
      lastCustomScreenPos.current = fallback;
    }
  }, [customOrigin]);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region, duration) => mapRef.current?.animateToRegion(region, duration),
    getMapRef: () => mapRef.current,
    pointForCoordinate: (coords) => mapRef.current?.pointForCoordinate(coords),
    refreshUserPosition: updateUserScreenPosition,
  }));

  // Update positions when coordinates change
  useEffect(() => {
    if (userCoords && mapRef.current) {
      updateUserScreenPosition();
    }
  }, [userCoords, updateUserScreenPosition]);

  useEffect(() => {
    if (customOrigin && mapRef.current) {
      updateCustomScreenPosition();
    }
  }, [customOrigin, updateCustomScreenPosition]);

  // Location tracking
  useEffect(() => {
    let subscriber = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('denied');
        setUserCoords(NAIROBI);
        return;
      }
      setLocationStatus('granted');
      const initial = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: initial.coords.latitude, longitude: initial.coords.longitude };
      setUserCoords(coords);
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.025, longitudeDelta: 0.025 }, 800);
      subscriber = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 15 },
        (loc) => setUserCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
      );
    })();
    return () => subscriber?.remove();
  }, []);

  const onMapRegionChange = useCallback(() => {
    onMapInteraction?.();
  }, [onMapInteraction]);

  const onMapRegionChangeComplete = useCallback(() => {
    updateUserScreenPosition();
    if (customOrigin) {
      updateCustomScreenPosition();
    }
  }, [updateUserScreenPosition, updateCustomScreenPosition, customOrigin]);

  const handleLongPress = useCallback((e) => {
    if (scanState !== 'idle') return;
    const coords = e.nativeEvent.coordinate;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCustomOrigin(coords);
    customOriginAnim.setValue(0);
    Animated.spring(customOriginAnim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }).start();
    mapRef.current?.animateToRegion({
      ...coords,
      latitudeDelta: 0.025,
      longitudeDelta: 0.025,
    }, 400);
  }, [scanState]);

  const clearCustomOrigin = useCallback(() => {
    setCustomOrigin(null);
    setCustomScreenPos(null);
    customOriginAnim.setValue(0);
  }, []);

  const circleColor = activeCategory?.color ?? '#22C55E';

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={NAIROBI}
        customMapStyle={DARK_MAP_STYLE}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        onRegionChange={onMapRegionChange}
        onRegionChangeComplete={onMapRegionChangeComplete}
        onPanDrag={onMapInteraction}
        onPress={onMapPress}
        onLongPress={handleLongPress}
      >
        {userCoords && (
          <>
            <Marker coordinate={userCoords} anchor={{ x: 0.5, y: 0.5 }} zIndex={99}>
              <View style={styles.userWrap}>
                <View style={styles.userRingOuter} />
                <View style={styles.userRingInner} />
                <View style={styles.userCore} />
              </View>
            </Marker>
            <Circle
              center={scanOrigin || userCoords}
              radius={searchRadius * 1000}
              fillColor={circleColor + '08'}
              strokeColor={circleColor + '28'}
              strokeWidth={1}
            />
          </>
        )}

        {customOrigin && (
          <Marker coordinate={customOrigin} anchor={{ x: 0.5, y: 0.5 }} zIndex={90}>
            <View style={styles.customOriginWrap}>
              <View style={styles.customOriginRing} />
              <View style={styles.customOriginCore} />
            </View>
          </Marker>
        )}

        {scanState === 'results' && providers.map(p => (
          <React.Fragment key={p.id}>
            <Marker
              coordinate={p.coordinates}
              anchor={{ x: 0.5, y: 0.5 }}
              zIndex={selectedProvider?.id === p.id ? 50 : 10}
              onPress={() => onSelectProvider(p)}
            >
              <Animated.View style={[styles.pinWrap, { opacity: pinsOpacity }]}>
                <View style={[styles.pinOuter, { borderColor: p.color + '60' }]}>
                  <View style={[styles.pinInner, { backgroundColor: p.color }]} />
                </View>
              </Animated.View>
            </Marker>
            {selectedProvider?.id === p.id && (
              <Circle
                center={p.coordinates}
                radius={p.radiusKm * 1000}
                fillColor={p.color + '12'}
                strokeColor={p.color + '45'}
                strokeWidth={1.5}
              />
            )}
          </React.Fragment>
        ))}
      </MapView>

      {customOrigin && scanState === 'idle' && (
        <Animated.View
          style={[
            styles.customOriginBanner,
            {
              opacity: customOriginAnim,
              transform: [{ scale: customOriginAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
            },
          ]}
        >
          <Icon name="map-pin" size={11} color="#EAB308" />
          <Text style={styles.customOriginText}>Scanning from custom point</Text>
          <TouchableOpacity onPress={clearCustomOrigin} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="times" size={11} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {scanState === 'scanning' && sonarPos && (
        <View
          pointerEvents="none"
          style={[styles.sonarContainer, {
            left: sonarPos.x - SONAR_SIZE / 2,
            top: sonarPos.y - SONAR_SIZE / 2,
            width: SONAR_SIZE,
            height: SONAR_SIZE,
          }]}
        >
          <SonarPing anim={sonarAnim1} color={circleColor} size={SONAR_SIZE} />
          <SonarPing anim={sonarAnim2} color={circleColor} size={SONAR_SIZE} />
          <SonarPing anim={sonarAnim3} color={circleColor} size={SONAR_SIZE} />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  userWrap: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  userRingOuter: { position: 'absolute', width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(34,197,94,0.15)' },
  userRingInner: { position: 'absolute', width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' },
  userCore: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#22C55E', borderWidth: 2.5, borderColor: '#080808' },
  customOriginWrap: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  customOriginRing: { position: 'absolute', width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(234,179,8,0.4)', borderStyle: 'dashed' },
  customOriginCore: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EAB308', borderWidth: 2, borderColor: '#080808' },
  pinWrap: { alignItems: 'center', justifyContent: 'center' },
  pinOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,8,8,0.7)' },
  pinInner: { width: 8, height: 8, borderRadius: 4 },
  sonarContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  customOriginBanner: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(9,9,11,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.28)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    zIndex: 20,
  },
  customOriginText: {
    fontSize: 11,
    color: '#EAB308',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default ScanMap;