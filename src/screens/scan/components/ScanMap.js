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
  const SONAR_SIZE = width * 0.72;

  useImperativeHandle(ref, () => ({
    animateToRegion: (region, duration) => mapRef.current?.animateToRegion(region, duration),
    getMapRef: () => mapRef.current,
    pointForCoordinate: (coords) => mapRef.current?.pointForCoordinate(coords),
  }));

  const updateUserScreenPosition = useCallback(async () => {
    if (!mapRef.current || !userCoords) return;
    try {
      const point = await mapRef.current.pointForCoordinate(userCoords);
      if (point) setUserScreenPos({ x: point.x, y: point.y });
    } catch (error) {
      setUserScreenPos({ x: width / 2, y: height / 2 });
    }
  }, [userCoords]);

  useEffect(() => {
    if (userCoords && mapRef.current) {
      const timeout = setTimeout(updateUserScreenPosition, 100);
      return () => clearTimeout(timeout);
    }
  }, [userCoords, updateUserScreenPosition]);

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
    updateUserScreenPosition();
  }, [updateUserScreenPosition, onMapInteraction]);

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
        onRegionChangeComplete={onMapRegionChange}
        onPanDrag={onMapInteraction}
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
              center={userCoords}
              radius={searchRadius * 1000}
              fillColor="rgba(34,197,94,0.025)"
              strokeColor="rgba(34,197,94,0.1)"
              strokeWidth={1}
            />
          </>
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

      {scanState === 'scanning' && userScreenPos && (
        <View style={[styles.sonarContainer, {
          left: userScreenPos.x - SONAR_SIZE / 2,
          top: userScreenPos.y - SONAR_SIZE / 2,
          width: SONAR_SIZE,
          height: SONAR_SIZE,
        }]}>
          <SonarPing anim={sonarAnim1} color={activeCategory?.color ?? '#22C55E'} size={SONAR_SIZE} />
          <SonarPing anim={sonarAnim2} color={activeCategory?.color ?? '#22C55E'} size={SONAR_SIZE} />
          <SonarPing anim={sonarAnim3} color={activeCategory?.color ?? '#22C55E'} size={SONAR_SIZE} />
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
  pinWrap: { alignItems: 'center', justifyContent: 'center' },
  pinOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,8,8,0.7)' },
  pinInner: { width: 8, height: 8, borderRadius: 4 },
  sonarContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
});

export default ScanMap;