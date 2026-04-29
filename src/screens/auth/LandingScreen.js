// src/screens/auth/LandingScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../utils/theme';

const { width, height } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'fundi',    label: 'Fundi',    color: '#3B82F6', icon: '🔧' },
  { id: 'food',     label: 'Food',     color: '#F97316', icon: '🍽️' },
  { id: 'bodaboda', label: 'Boda',     color: '#EAB308', icon: '🏍️' },
  { id: 'salon',    label: 'Salon',    color: '#A855F7', icon: '✂️' },
  { id: 'tutor',    label: 'Tutor',    color: '#22C55E', icon: '📚' },
  { id: 'delivery', label: 'Delivery', color: '#EF4444', icon: '📦' },
  { id: 'health',   label: 'Health',   color: '#14B8A6', icon: '🩺' },
];

// Radar arc positions — scattered across screen
const ORBS = [
  { x: width * 0.15, y: height * 0.18, size: 220, color: '#3B82F6', delay: 0 },
  { x: width * 0.72, y: height * 0.12, size: 160, color: '#A855F7', delay: 800 },
  { x: width * 0.85, y: height * 0.55, size: 200, color: '#22C55E', delay: 400 },
  { x: width * 0.08, y: height * 0.65, size: 140, color: '#F97316', delay: 1200 },
  { x: width * 0.55, y: height * 0.82, size: 180, color: '#14B8A6', delay: 600 },
];

const RadarOrb = ({ x, y, size, color, delay }) => {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1000,
      delay,
      useNativeDriver: true,
    }).start();

    // Gentle breathe
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1,
          duration: 3000 + delay * 0.2,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.6,
          duration: 3000 + delay * 0.2,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Outward ping ring
    const pingLoop = () => {
      ringScale.setValue(1);
      ringOpacity.setValue(0.4);
      Animated.parallel([
        Animated.timing(ringScale, {
          toValue: 2.2,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: true,
        }),
      ]).start(() => setTimeout(pingLoop, 1800 + delay * 0.5));
    };
    setTimeout(pingLoop, delay + 600);
  }, []);

  return (
    <Animated.View
      style={[
        styles.orbWrapper,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          opacity,
        },
      ]}
    >
      {/* Ping ring */}
      <Animated.View
        style={[
          styles.pingRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
          },
        ]}
      />
      {/* Core orb */}
      <Animated.View
        style={[
          styles.orb,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            transform: [{ scale }],
          },
        ]}
      />
    </Animated.View>
  );
};

const CategoryPill = ({ item, onPress, index }) => {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(12)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 400,
        delay: 600 + index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 400,
        delay: 600 + index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 30,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeIn,
        transform: [{ translateY: slideUp }, { scale: pressScale }],
      }}
    >
      <TouchableOpacity
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={28} tint="dark" style={styles.pillBlur}>
            <PillInner item={item} />
          </BlurView>
        ) : (
          <View style={[styles.pillBlur, { backgroundColor: 'rgba(30,30,30,0.88)' }]}>
            <PillInner item={item} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const PillInner = ({ item }) => (
  <>
    <View style={[styles.pillDot, { backgroundColor: item.color }]} />
    <Text style={styles.pillIcon}>{item.icon}</Text>
    <Text style={styles.pillLabel}>{item.label}</Text>
  </>
);

const LandingScreen = () => {
  const navigation = useNavigation();
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(24)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header entrance
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 900,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 900,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Buttons entrance
    Animated.timing(btnOpacity, {
      toValue: 1,
      duration: 600,
      delay: 1000,
      useNativeDriver: true,
    }).start();

    // Radar scan line sweep
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 3600,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const scanRotate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleCategory = (cat) => {
    navigation.navigate('Login', { selectedCategory: cat.id });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Ambient orbs layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {ORBS.map((orb, i) => (
          <RadarOrb key={i} {...orb} />
        ))}
      </View>

      {/* Subtle noise / grid overlay */}
      <View style={styles.gridOverlay} pointerEvents="none" />

      {/* Radar sweep circle */}
      <View style={styles.radarCircleWrap} pointerEvents="none">
        <View style={styles.radarCircleOuter} />
        <View style={styles.radarCircleMid} />
        <View style={styles.radarCircleInner} />
        {/* Sweep line */}
        <Animated.View
          style={[
            styles.sweepLine,
            { transform: [{ rotate: scanRotate }] },
          ]}
        >
          <LinearGradient
            colors={['rgba(34,197,94,0.0)', 'rgba(34,197,94,0.55)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        {/* Center dot */}
        <View style={styles.radarDot} />
      </View>

      {/* Main scroll content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top wordmark */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerSlide }],
            },
          ]}
        >
          <Text style={styles.wordmark}>RADA KE</Text>
          <View style={styles.taglineRow}>
            <View style={styles.taglineLine} />
            <Text style={styles.tagline}>scan · discover · connect</Text>
            <View style={styles.taglineLine} />
          </View>
        </Animated.View>

        {/* Category label */}
        <Animated.View style={{ opacity: headerOpacity }}>
          <Text style={styles.questionLabel}>What do you need today?</Text>
        </Animated.View>

        {/* Category pills — two rows for premium feel */}
        <View style={styles.pillsGrid}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsRow}
          >
            {CATEGORIES.slice(0, 4).map((cat, i) => (
              <CategoryPill key={cat.id} item={cat} onPress={handleCategory} index={i} />
            ))}
          </ScrollView>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.pillsRow, styles.pillsRowOffset]}
          >
            {CATEGORIES.slice(4).map((cat, i) => (
              <CategoryPill key={cat.id} item={cat} onPress={handleCategory} index={i + 4} />
            ))}
          </ScrollView>
        </View>

        {/* Bottom CTA block */}
        <Animated.View style={[styles.ctaBlock, { opacity: btnOpacity }]}>
          {/* Primary button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.88}
            style={styles.primaryBtnWrap}
          >
            <LinearGradient
              colors={['#22C55E', '#16a34a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Get Started</Text>
              <Text style={styles.primaryBtnArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Ghost button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
            style={styles.ghostBtn}
          >
            <Text style={styles.ghostBtnText}>I already have an account</Text>
          </TouchableOpacity>

          {/* Fine print */}
          <Text style={styles.finePrint}>Nairobi · Eldoret · Mombasa</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const RADAR_SIZE = width * 1.1;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080808',
  },

  // ── Orbs ──────────────────────────────────────────────
  orbWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    position: 'absolute',
    opacity: 0.07,
  },
  pingRing: {
    position: 'absolute',
    borderWidth: 1,
    opacity: 0,
  },

  // ── Grid overlay ───────────────────────────────────────
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },

  // ── Radar circle ──────────────────────────────────────
  radarCircleWrap: {
    position: 'absolute',
    top: height * 0.28,
    left: (width - RADAR_SIZE) / 2,
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarCircleOuter: {
    position: 'absolute',
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    borderRadius: RADAR_SIZE / 2,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.1)',
  },
  radarCircleMid: {
    position: 'absolute',
    width: RADAR_SIZE * 0.65,
    height: RADAR_SIZE * 0.65,
    borderRadius: RADAR_SIZE * 0.325,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.08)',
  },
  radarCircleInner: {
    position: 'absolute',
    width: RADAR_SIZE * 0.3,
    height: RADAR_SIZE * 0.3,
    borderRadius: RADAR_SIZE * 0.15,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.12)',
  },
  sweepLine: {
    position: 'absolute',
    width: RADAR_SIZE / 2,
    height: 1.5,
    right: RADAR_SIZE / 2,
    top: RADAR_SIZE / 2 - 0.75,
    transformOrigin: 'right center',
  },
  radarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    opacity: 0.8,
  },

  // ── Scroll ────────────────────────────────────────────
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.1,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },

  // ── Header ────────────────────────────────────────────
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  wordmark: {
    fontSize: 52,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 10,
    textAlign: 'center',
    marginBottom: 14,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taglineLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tagline: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // ── Category section ──────────────────────────────────
  questionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  pillsGrid: {
    gap: 10,
    marginBottom: 40,
  },
  pillsRow: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: 'row',
    gap: 8,
  },
  pillsRowOffset: {
    paddingLeft: 28,
  },
  pillBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    gap: 6,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillIcon: {
    fontSize: 14,
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.2,
  },

  // ── CTA Block ─────────────────────────────────────────
  ctaBlock: {
    alignItems: 'center',
    gap: 0,
  },
  primaryBtnWrap: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    paddingHorizontal: 28,
    gap: 10,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  primaryBtnArrow: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
  },
  ghostBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  ghostBtnText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.2,
  },
  finePrint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.18)',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
});

export default LandingScreen;