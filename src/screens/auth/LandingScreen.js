import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import theme from '../../utils/theme';

const { width, height } = Dimensions.get('window');

const DEFAULT_REGION = {
  latitude: -1.286389,
  longitude: 36.817223,
  latitudeDelta: 0.035,
  longitudeDelta: 0.035,
};

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0d0d0d' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d0d0d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4a4a4a' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#888888' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#111111' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1c1c1c' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#ff4444' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#050505' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] },
];

const LOGO_IMAGE = require('../../../assets/logo.jpg');

const LandingScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim3 = useRef(new Animated.Value(0)).current;
  const dotAnim = useRef(new Animated.Value(1)).current;

  const [cityLabel, setCityLabel] = useState('Live');
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);

  useEffect(() => {
    // Panel entrance
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, delay: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, delay: 400, useNativeDriver: true }),
    ]).start();

    // Live dot pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 0.2, duration: 800, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Radar pulse rings — staggered
    const pulse = (anim, delay) => {
      anim.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 2500, useNativeDriver: true }),
      ]).start(() => pulse(anim, delay));
    };
    pulse(pulseAnim1, 0);
    pulse(pulseAnim2, 800);
    pulse(pulseAnim3, 1600);

    // Location
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      setMapRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.035,
        longitudeDelta: 0.035,
      });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (place?.city) setCityLabel(place.city);
    })();
  }, []);

  const makePulseStyle = (anim) => ({
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 2.8] }) }],
    opacity: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.7, 0.4, 0] }),
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Map Section */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          customMapStyle={DARK_MAP_STYLE}
          region={mapRegion}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        />

        {/* Radar pulse rings */}
        <View style={styles.radarCenter} pointerEvents="none">
          <Animated.View style={[styles.pulseRing, makePulseStyle(pulseAnim1)]} />
          <Animated.View style={[styles.pulseRing, makePulseStyle(pulseAnim2)]} />
          <Animated.View style={[styles.pulseRing, makePulseStyle(pulseAnim3)]} />
          <View style={styles.centerDotOuter}>
            <View style={styles.centerDotInner} />
          </View>
        </View>

        {/* Live pill */}
        <View style={styles.livePill}>
          <Animated.View style={[styles.livePillDot, { opacity: dotAnim }]} />
          <Text style={styles.livePillText}>{cityLabel} · Live</Text>
        </View>

        {/* Dark vignette overlay */}
        <View style={styles.vignette} pointerEvents="none" />
      </View>

      {/* Colored border separator */}
      <View style={styles.borderSeparator} />

      {/* Bottom content panel */}
      <Animated.View
        style={[
          styles.bottomPanel,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Logo + Brand - centered, YOUR original layout */}
        <View style={styles.centerLogoContainer}>
          <View style={styles.logoCircle}>
            <Image
              source={LOGO_IMAGE}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandName}>RADA KE</Text>
          <Text style={styles.tagline}>Scan your environment. Find what's near you.</Text>
        </View>

        {/* Indicators row — replaces stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.indIcon}>⦿</Text>
            <Text style={styles.statLabel}>Real-time</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.indIcon}>◎</Text>
            <Text style={styles.statLabel}>Anywhere</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.livePillInline}>
              <Animated.View style={[styles.liveDot, { opacity: dotAnim }]} />
              <Text style={styles.livePillText2}>{cityLabel}</Text>
            </View>
            <Text style={styles.statLabel}>Live</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.loginBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginBtnText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signupBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.signupBtnText}>Get Started</Text>
          </TouchableOpacity>
        </View>

        {/* Version footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mapContainer: {
    height: height * 0.44,
    width: '100%',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.mapOverlay,
  },
  radarCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -60,
    marginLeft: -60,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  centerDotOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  livePill: {
    position: 'absolute',
    top: 52,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    zIndex: 3,
  },
  livePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  livePillText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  borderSeparator: {
    height: 2,
    backgroundColor: theme.colors.primary,
    opacity: 0.4,
    width: '100%',
  },
  bottomPanel: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    ...theme.shadowRed,
  },
  centerLogoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
    ...theme.shadowRed,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  brandName: {
    ...theme.typography.h1,
    fontSize: 30,
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    ...theme.typography.bodySmall,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '80%',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  indIcon: {
    fontSize: 18,
    color: theme.colors.primaryMuted,
    lineHeight: 22,
  },
  statLabel: {
    ...theme.typography.caption,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 0.5,
    height: 30,
    backgroundColor: theme.colors.border,
  },
  livePillInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  livePillText2: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primaryMuted,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: theme.spacing.md,
  },
  loginBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.primaryBorder,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loginBtnText: {
    color: theme.colors.primaryMuted,
    ...theme.typography.button,
  },
  signupBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    ...theme.shadowRed,
  },
  signupBtnText: {
    color: theme.colors.text,
    ...theme.typography.buttonLarge,
  },
  footer: {
    alignItems: 'center',
    marginTop: 4,
  },
  versionText: {
    fontSize: 10,
    color: theme.colors.textFaint,
    letterSpacing: 0.5,
  },
});

export default LandingScreen;