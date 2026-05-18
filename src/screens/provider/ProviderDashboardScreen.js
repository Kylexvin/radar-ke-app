// src/screens/provider/ProviderDashboardScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  { type: 'view', msg: 'Someone in Westlands viewed your profile', time: '2m ago', icon: 'eye-outline', color: theme.colors.primary },
  { type: 'contact', msg: 'New WhatsApp tap from Kilimani', time: '18m ago', icon: 'logo-whatsapp', color: theme.colors.success },
  { type: 'view', msg: 'Someone in Lavington viewed your profile', time: '1h ago', icon: 'eye-outline', color: theme.colors.primary },
  { type: 'contact', msg: 'Call tap from Dagoretti', time: '2h ago', icon: 'call-outline', color: theme.colors.warning },
  { type: 'view', msg: 'Someone in Karen viewed your profile', time: '3h ago', icon: 'eye-outline', color: theme.colors.primary },
];

const TIPS = [
  'Add a WhatsApp number to get 3x more contacts',
  'Providers with descriptions get 60% more views',
  'Keep your status Active during business hours',
];

export default function ProviderDashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { providerProfile, user } = useAuth();
  const [isActive, setIsActive] = useState(providerProfile?.isActive ?? true);
  const [tipIndex] = useState(Math.floor(Math.random() * TIPS.length));

  const businessName = providerProfile?.businessName || 'Your Business';
  const initials = businessName.charAt(0).toUpperCase();

  return (
    <View style={[styles.root, { paddingTop: 0 }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.greeting}>My Shop</Text>
            <Text style={styles.businessName} numberOfLines={1}>{businessName}</Text>
          </View>
        </View>

        {/* Active toggle */}
        <View style={[styles.activeToggle, { borderColor: isActive ? 'rgba(34,197,94,0.3)' : theme.colors.border }]}>
          <View style={[styles.activeDot, { backgroundColor: isActive ? theme.colors.success : theme.colors.textDim }]} />
          <Text style={[styles.activeText, { color: isActive ? theme.colors.success : theme.colors.textMuted }]}>
            {isActive ? 'Live' : 'Hidden'}
          </Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: theme.colors.border, true: 'rgba(34,197,94,0.35)' }}
            thumbColor={isActive ? theme.colors.success : theme.colors.textDim}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        {/* Verification banner */}
        {!providerProfile?.isVerified && (
          <TouchableOpacity style={styles.verifyBanner} activeOpacity={0.8}>
            <Ionicons name="shield-outline" size={16} color={theme.colors.warning} />
            <Text style={styles.verifyText}>Get verified to build trust with customers</Text>
            <Ionicons name="chevron-forward" size={14} color={theme.colors.warning} />
          </TouchableOpacity>
        )}

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          {QUICK_STATS.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: s.color + '18' }]}>
                <Ionicons name={s.icon} size={16} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Tip card */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={16} color="#FFD700" />
          <Text style={styles.tipText}>{TIPS[tipIndex]}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.primarySurface }]}>
                <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionLabel}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('Analytics')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
                <Ionicons name="bar-chart-outline" size={20} color={theme.colors.success} />
              </View>
              <Text style={styles.actionLabel}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.75}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(255,140,0,0.1)' }]}>
                <Ionicons name="share-social-outline" size={20} color={theme.colors.warning} />
              </View>
              <Text style={styles.actionLabel}>Share Link</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.75}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
                <Ionicons name="help-circle-outline" size={20} color={theme.colors.info} />
              </View>
              <Text style={styles.actionLabel}>Help</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {RECENT_ACTIVITY.map((a, i) => (
              <View key={i} style={[styles.activityRow, i === RECENT_ACTIVITY.length - 1 && styles.activityRowLast]}>
                <View style={[styles.activityIcon, { backgroundColor: a.color + '18' }]}>
                  <Ionicons name={a.icon} size={14} color={a.color} />
                </View>
                <Text style={styles.activityMsg} numberOfLines={1}>{a.msg}</Text>
                <Text style={styles.activityTime}>{a.time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Profile completeness */}
        <View style={styles.section}>
          <View style={styles.completeHeader}>
            <Text style={styles.sectionTitle}>Profile Completeness</Text>
            <Text style={styles.completePct}>60%</Text>
          </View>
          <View style={styles.completeBarBg}>
            <View style={[styles.completeBarFill, { width: '60%' }]} />
          </View>
          <View style={styles.completeItems}>
            {[
              { label: 'Business name', done: true },
              { label: 'Phone number', done: false },
              { label: 'WhatsApp', done: false },
              { label: 'Description', done: true },
              { label: 'Category set', done: true },
            ].map((item, i) => (
              <View key={i} style={styles.completeItem}>
                <Ionicons
                  name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={15}
                  color={item.done ? theme.colors.success : theme.colors.textDim}
                />
                <Text style={[styles.completeItemText, !item.done && { color: theme.colors.textMuted }]}>
                  {item.label}
                </Text>
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
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primarySurface,
    borderWidth: 1.5,
    borderColor: theme.colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  greeting: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textDim,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  businessName: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.text,
    maxWidth: width * 0.4,
  },
  activeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.surface,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scroll: {
    padding: theme.spacing.lg,
    gap: 14,
  },
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,140,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,140,0,0.25)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  verifyText: {
    flex: 1,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.warning,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
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
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '800',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 9,
    color: theme.colors.textDim,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,215,0,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.18)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tipText: {
    flex: 1,
    fontSize: theme.fontSizes.sm,
    color: 'rgba(255,215,0,0.85)',
    fontWeight: '500',
    lineHeight: 18,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityList: {
    gap: 0,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  activityRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  activityIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityMsg: {
    flex: 1,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 10,
    color: theme.colors.textDim,
    fontWeight: '500',
  },
  completeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completePct: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  completeBarBg: {
    height: 6,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  completeBarFill: {
    height: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  completeItems: {
    gap: 10,
  },
  completeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completeItemText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
});