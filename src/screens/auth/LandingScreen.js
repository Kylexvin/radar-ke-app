import React, { useEffect, useRef } from 'react';
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
import theme from '../../utils/theme';

const { width, height } = Dimensions.get('window');

const NAIROBI_COORDINATES = {
  latitude: -1.286389,
  longitude: 36.817223,
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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, delay: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, delay: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Map Section - reduced height */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          customMapStyle={DARK_MAP_STYLE}
          initialRegion={{
            ...NAIROBI_COORDINATES,
            latitudeDelta: 0.035,
            longitudeDelta: 0.035,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        />
        
        {/* Dark vignette overlay */}
        <View style={styles.vignette} pointerEvents="none" />
      </View>

      {/* Colored border separator between map and content */}
      <View style={styles.borderSeparator} />

      {/* Bottom content panel with curved corners */}
      <Animated.View
        style={[
          styles.bottomPanel,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Logo + Brand - centered */}
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

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2,400+</Text>
            <Text style={styles.statLabel}>Providers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>18</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>Live</Text>
            <Text style={styles.statLabel}>Real-time</Text>
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

        {/* Guest - commented out */}
        {/* <TouchableOpacity 
          style={styles.guestBtn} 
          activeOpacity={0.7}
          onPress={() => {
            // Handle guest navigation
            console.log('Guest mode - navigate to main app');
          }}
        >
          <Text style={styles.guestText}>Explore as Guest  →</Text>
        </TouchableOpacity> */}

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
    overflow: 'hidden', // Important: ensures image respects border radius
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
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primaryMuted,
    marginBottom: 2,
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
  guestBtn: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  guestText: {
    color: theme.colors.textDim,
    fontSize: 13,
    letterSpacing: 0.3,
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