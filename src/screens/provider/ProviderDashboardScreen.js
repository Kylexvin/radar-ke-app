// src/screens/provider/ProviderDashboardScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import theme from '../../utils/theme';

const { width } = Dimensions.get('window');

const QUICK_STATS = [
  { label: 'Views today', value: '34', icon: 'eye-outline', color: theme.colors.primary },
  { label: 'Contacts', value: '7', icon: 'call-outline', color: theme.colors.success },
  { label: 'This week', value: '182', icon: 'trending-up-outline', color: theme.colors.warning },
  { label: 'Rating', value: '4.7', icon: 'star-outline', color: '#FFD700' },
];

const RECENT_ACTIVITY = [
  { msg: 'Someone in Westlands viewed your profile', time: '2m ago', icon: 'eye-outline', color: theme.colors.primary },
  { msg: 'New WhatsApp tap from Kilimani', time: '18m ago', icon: 'logo-whatsapp', color: theme.colors.success },
  { msg: 'Someone in Lavington viewed your profile', time: '1h ago', icon: 'eye-outline', color: theme.colors.primary },
  { msg: 'Call tap from Dagoretti', time: '2h ago', icon: 'call-outline', color: theme.colors.warning },
];

const TIPS = [
  'Add a WhatsApp number to get 3x more contacts',
  'Providers with descriptions get 60% more views',
  'Keep your status Active during business hours',
  'Enable Showcase to display what you offer',
];

const CAPABILITIES = [
  {
    key: 'canBeContacted',
    icon: 'call-outline',
    label: 'Contact',
    desc: 'Customers can call or WhatsApp you',
    color: theme.colors.success,
    locked: true,
  },
  {
    key: 'hasShowcase',
    icon: 'images-outline',
    label: 'Showcase',
    desc: 'Display your products or portfolio',
    color: theme.colors.primary,
    locked: false,
    screen: 'Showcase',
  },
  {
    key: 'hasShop',
    icon: 'cart-outline',
    label: 'Online Shop',
    desc: 'Accept orders and M-Pesa payments',
    color: theme.colors.warning,
    locked: false,
    comingSoon: false, // Changed to false - screen exists
    screen: 'Orders',
  },
  {
    key: 'takesBookings',
    icon: 'calendar-outline',
    label: 'Bookings',
    desc: 'Let customers reserve your time',
    color: theme.colors.info,
    locked: false,
    comingSoon: false, // Changed to false - screen exists
    screen: 'Bookings',
  },
];

export default function ProviderDashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { providerProfile } = useAuth();

  const [isActive, setIsActive] = useState(providerProfile?.isActive ?? true);
  const [tipIndex] = useState(Math.floor(Math.random() * TIPS.length));

  const [capabilities, setCapabilities] = useState({
    canBeContacted: true,
    hasShowcase: providerProfile?.capabilities?.hasShowcase ?? false,
    hasShop: providerProfile?.capabilities?.hasShop ?? false,
    takesBookings: providerProfile?.capabilities?.takesBookings ?? false,
  });

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.35, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  const businessName = providerProfile?.businessName || 'Your Business';
  const initials = businessName.charAt(0).toUpperCase();

  const goToBrowse = () => navigation.getParent()?.navigate('Scan');

  const toggleCapability = (key) => {
    setCapabilities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCapabilitySetup = (cap) => {
    if (cap.comingSoon) {
      // Show coming soon alert or just return
      return;
    }
    if (cap.screen) {
      if (!capabilities[cap.key]) {
        toggleCapability(cap.key);
      }
      navigation.navigate(cap.screen);
    }
  };

  const completionItems = [
    { label: 'Business name', done: !!providerProfile?.businessName },
    { label: 'Phone number', done: !!providerProfile?.phone },
    { label: 'WhatsApp', done: !!providerProfile?.whatsapp },
    { label: 'Description', done: !!providerProfile?.description },
    { label: 'Category set', done: !!providerProfile?.categoryId },
  ];
  const completionPct = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} translucent />
      
      {/* Header - ZERO padding top */}
      <LinearGradient
        colors={[theme.colors.background, theme.colors.background]}
        style={[styles.header, { marginTop: Platform.OS === 'ios' ? insets.top : 0 }]}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.avatarGradient}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </LinearGradient>
            <View>
              <Text style={styles.greeting}>WELCOME BACK</Text>
              <Text style={styles.businessName}>{businessName}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.notificationBtn} 
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <View style={styles.statusIndicator}>
              {isActive && (
                <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
              )}
              <View style={[styles.statusDot, { backgroundColor: isActive ? theme.colors.success : theme.colors.textDim }]} />
              <Text style={[styles.statusText, { color: isActive ? theme.colors.success : theme.colors.textMuted }]}>
                {isActive ? 'Active & Accepting Customers' : 'Offline Mode'}
              </Text>
            </View>
            <Text style={styles.statusDesc}>
              {isActive 
                ? 'Your business is visible to customers nearby' 
                : 'Toggle on to start receiving customers'}
            </Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: theme.colors.border, true: theme.colors.success + '40' }}
            thumbColor={isActive ? theme.colors.success : theme.colors.textDim}
          />
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        {!providerProfile?.isVerified && (
          <TouchableOpacity style={styles.verifyBanner} activeOpacity={0.8}>
            <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.warning} />
            <Text style={styles.verifyText}>Get verified to build trust with customers</Text>
            <Ionicons name="arrow-forward" size={14} color={theme.colors.warning} />
          </TouchableOpacity>
        )}

        <View style={styles.statsRow}>
          {QUICK_STATS.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '15' }]}>
                <Ionicons name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={18} color="#FFD700" />
          <Text style={styles.tipText}>{TIPS[tipIndex]}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Profile')} activeOpacity={0.75}>
              <LinearGradient
                colors={[theme.colors.primary + '20', theme.colors.primary + '05']}
                style={styles.actionIcon}
              >
                <Ionicons name="create-outline" size={22} color={theme.colors.primary} />
              </LinearGradient>
              <Text style={styles.actionLabel}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Analytics')} activeOpacity={0.75}>
              <LinearGradient
                colors={[theme.colors.success + '20', theme.colors.success + '05']}
                style={styles.actionIcon}
              >
                <Ionicons name="bar-chart-outline" size={22} color={theme.colors.success} />
              </LinearGradient>
              <Text style={styles.actionLabel}>Analytics</Text>
            </TouchableOpacity>

            {capabilities.hasShowcase && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Showcase')} activeOpacity={0.75}>
                <LinearGradient
                  colors={[theme.colors.primary + '20', theme.colors.primary + '05']}
                  style={styles.actionIcon}
                >
                  <Ionicons name="images-outline" size={22} color={theme.colors.primary} />
                </LinearGradient>
                <Text style={styles.actionLabel}>Showcase</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.actionBtn} onPress={goToBrowse} activeOpacity={0.75}>
              <LinearGradient
                colors={['#3498db20', '#3498db05']}
                style={styles.actionIcon}
              >
                <Ionicons name="map-outline" size={22} color="#3498db" />
              </LinearGradient>
              <Text style={styles.actionLabel}>Nearby</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Capabilities</Text>
            <Text style={styles.cardSubtitle}>Unlock more for your business</Text>
          </View>
          {CAPABILITIES.map((cap, i) => {
            const isOn = capabilities[cap.key];
            const isLast = i === CAPABILITIES.length - 1;
            return (
              <View key={cap.key} style={[styles.capRow, !isLast && styles.capRowBorder]}>
                <View style={[styles.capIconWrap, { backgroundColor: cap.color + '15' }]}>
                  <Ionicons name={cap.icon} size={20} color={cap.color} />
                </View>
                <View style={styles.capInfo}>
                  <View style={styles.capLabelRow}>
                    <Text style={styles.capLabel}>{cap.label}</Text>
                    {cap.comingSoon && (
                      <View style={styles.soonBadge}>
                        <Text style={styles.soonText}>Soon</Text>
                      </View>
                    )}
                    {cap.locked && (
                      <View style={[styles.soonBadge, { backgroundColor: theme.colors.success + '15' }]}>
                        <Text style={[styles.soonText, { color: theme.colors.success }]}>Always on</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.capDesc}>{cap.desc}</Text>
                  {!cap.locked && !cap.comingSoon && (
                    <TouchableOpacity onPress={() => handleCapabilitySetup(cap)}>
                      <Text style={[styles.capSetupText, { color: cap.color }]}>
                        {isOn ? 'Manage →' : 'Set up →'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                {cap.locked ? (
                  <Ionicons name="lock-closed" size={16} color={theme.colors.textDim} />
                ) : (
                  <Switch
                    value={isOn}
                    onValueChange={() => toggleCapability(cap.key)}
                    trackColor={{ false: theme.colors.border, true: cap.color + '40' }}
                    thumbColor={isOn ? cap.color : theme.colors.textDim}
                  />
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          {RECENT_ACTIVITY.map((a, i) => (
            <View key={i} style={[styles.activityRow, i === RECENT_ACTIVITY.length - 1 && styles.activityRowLast]}>
              <View style={[styles.activityIcon, { backgroundColor: a.color + '15' }]}>
                <Ionicons name={a.icon} size={14} color={a.color} />
              </View>
              <Text style={styles.activityMsg}>{a.msg}</Text>
              <Text style={styles.activityTime}>{a.time}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.completeHeader}>
            <Text style={styles.cardTitle}>Profile Completeness</Text>
            <Text style={[styles.completePct, { color: completionPct === 100 ? theme.colors.success : theme.colors.primary }]}>
              {completionPct}%
            </Text>
          </View>
          <View style={styles.completeBarBg}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.completeBarFill, { width: `${completionPct}%` }]}
            />
          </View>
          <View style={styles.completeItems}>
            {completionItems.map((item, i) => (
              <View key={i} style={styles.completeItem}>
                <Ionicons
                  name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={item.done ? theme.colors.success : theme.colors.textDim}
                />
                <Text style={[styles.completeItemText, !item.done && { color: theme.colors.textMuted }]}>
                  {item.label}
                </Text>
                {!item.done && (
                  <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Text style={styles.completeAddText}>Add →</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    // ZERO padding top
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 2,
  },
  avatar: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  greeting: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  businessName: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  notificationBtn: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  notificationCount: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.text,
    paddingHorizontal: 3,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusLeft: {
    flex: 1,
    gap: 4,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    position: 'absolute',
    left: -2,
    top: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.success + '40',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
  },
  statusDesc: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textMuted,
  },
  scroll: { 
    padding: theme.spacing.lg, 
    gap: 12 
  },
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.warning + '08',
    borderWidth: 1,
    borderColor: theme.colors.warning + '20',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  verifyText: { 
    flex: 1, 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.warning, 
    fontWeight: '500' 
  },
  statsRow: { 
    flexDirection: 'row', 
    gap: 10 
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  statIcon: { 
    width: 36, 
    height: 36, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  statValue: { 
    fontSize: theme.fontSizes.lg, 
    fontWeight: '800', 
    color: theme.colors.text 
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFD700' + '08',
    borderWidth: 1,
    borderColor: '#FFD700' + '20',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tipText: { 
    flex: 1, 
    fontSize: theme.fontSizes.sm, 
    color: '#FFD700' + 'cc', 
    fontWeight: '500', 
    lineHeight: 18 
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  cardHeader: { 
    gap: 4 
  },
  cardTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardSubtitle: { 
    fontSize: theme.fontSizes.xs, 
    color: theme.colors.textDim 
  },
  actionsRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12 
  },
  actionBtn: { 
    alignItems: 'center', 
    gap: 8, 
    width: (width - theme.spacing.lg * 2 - 48) / 4 
  },
  actionIcon: { 
    width: 56, 
    height: 56, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  actionLabel: { 
    fontSize: 11, 
    color: theme.colors.textMuted, 
    fontWeight: '600', 
    textAlign: 'center' 
  },
  capRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  capRowBorder: { 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.border 
  },
  capIconWrap: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  capInfo: { 
    flex: 1, 
    gap: 4 
  },
  capLabelRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  capLabel: { 
    fontSize: theme.fontSizes.md, 
    fontWeight: '600', 
    color: theme.colors.text 
  },
  capDesc: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textMuted 
  },
  capSetupText: { 
    fontSize: theme.fontSizes.sm, 
    fontWeight: '700' 
  },
  soonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  soonText: { 
    fontSize: 10, 
    fontWeight: '700', 
    letterSpacing: 0.5 
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  activityRowLast: { 
    borderBottomWidth: 0, 
    paddingBottom: 0 
  },
  activityIcon: { 
    width: 32, 
    height: 32, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  activityMsg: { 
    flex: 1, 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.text, 
    fontWeight: '500' 
  },
  activityTime: { 
    fontSize: 11, 
    color: theme.colors.textDim, 
    fontWeight: '500' 
  },
  completeHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  completePct: { 
    fontSize: theme.fontSizes.lg, 
    fontWeight: '800' 
  },
  completeBarBg: { 
    height: 6, 
    backgroundColor: theme.colors.surfaceLight, 
    borderRadius: 3, 
    overflow: 'hidden' 
  },
  completeBarFill: { 
    height: 6, 
    borderRadius: 3 
  },
  completeItems: { 
    gap: 12 
  },
  completeItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10 
  },
  completeItemText: { 
    flex: 1, 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.text, 
    fontWeight: '500' 
  },
  completeAddText: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.primary, 
    fontWeight: '700' 
  },
});