// src/screens/provider/AnalyticsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../utils/theme';

const { width } = Dimensions.get('window');

const PERIODS = ['Week', 'Month', '3 Months'];

const STATS = [
  { label: 'Total Views', value: '1,284', change: '+12%', up: true, icon: 'eye-outline' },
  { label: 'Contacts', value: '94', change: '+8%', up: true, icon: 'call-outline' },
  { label: 'WhatsApp Taps', value: '61', change: '-3%', up: false, icon: 'logo-whatsapp' },
  { label: 'Avg. Rating', value: '4.7', change: '+0.2', up: true, icon: 'star-outline' },
];

const BAR_DATA = [
  { day: 'Mon', views: 60, contacts: 8 },
  { day: 'Tue', views: 90, contacts: 14 },
  { day: 'Wed', views: 75, contacts: 11 },
  { day: 'Thu', views: 110, contacts: 18 },
  { day: 'Fri', views: 140, contacts: 22 },
  { day: 'Sat', views: 95, contacts: 15 },
  { day: 'Sun', views: 50, contacts: 7 },
];

const MAX_VAL = Math.max(...BAR_DATA.map(d => d.views));
const BAR_HEIGHT = 90;

const TOP_AREAS = [
  { area: 'Westlands', count: 38, pct: 0.82 },
  { area: 'Kilimani', count: 27, pct: 0.58 },
  { area: 'Lavington', count: 19, pct: 0.41 },
  { area: 'Dagoretti', count: 14, pct: 0.30 },
  { area: 'Karen', count: 9, pct: 0.19 },
];

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [activePeriod, setActivePeriod] = useState('Week');
  const [activeBar, setActiveBar] = useState(null);

  return (
    <View style={[styles.root, { paddingTop: 0 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, activePeriod === p && styles.periodBtnActive]}
              onPress={() => setActivePeriod(p)}
              activeOpacity={0.75}
            >
              <Text style={[styles.periodText, activePeriod === p && styles.periodTextActive]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        {/* Stat Cards */}
        <View style={styles.statsGrid}>
          {STATS.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={styles.statTop}>
                <View style={styles.statIconWrap}>
                  <Ionicons name={s.icon} size={15} color={theme.colors.primary} />
                </View>
                <View style={[
                  styles.changeBadge,
                  { backgroundColor: s.up ? 'rgba(34,197,94,0.12)' : 'rgba(255,32,32,0.12)' }
                ]}>
                  <Ionicons
                    name={s.up ? 'trending-up' : 'trending-down'}
                    size={10}
                    color={s.up ? theme.colors.success : theme.colors.error}
                  />
                  <Text style={[styles.changeText, { color: s.up ? theme.colors.success : theme.colors.error }]}>
                    {s.change}
                  </Text>
                </View>
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Bar Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Views this week</Text>
            <View style={styles.legend}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={styles.legendText}>Views</Text>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
              <Text style={styles.legendText}>Contacts</Text>
            </View>
          </View>

          <View style={styles.chart}>
            {BAR_DATA.map((d, i) => {
              const viewH = (d.views / MAX_VAL) * BAR_HEIGHT;
              const contactH = (d.contacts / MAX_VAL) * BAR_HEIGHT;
              const isActive = activeBar === i;
              return (
                <TouchableOpacity
                  key={i}
                  style={styles.barGroup}
                  onPress={() => setActiveBar(isActive ? null : i)}
                  activeOpacity={0.8}
                >
                  {isActive && (
                    <View style={styles.barTooltip}>
                      <Text style={styles.barTooltipText}>{d.views} views</Text>
                      <Text style={styles.barTooltipText}>{d.contacts} contacts</Text>
                    </View>
                  )}
                  <View style={styles.bars}>
                    <View style={[
                      styles.bar,
                      { height: viewH, backgroundColor: isActive ? theme.colors.primaryLight : theme.colors.primary + 'CC' }
                    ]} />
                    <View style={[
                      styles.bar,
                      { height: contactH, backgroundColor: isActive ? theme.colors.success : theme.colors.success + '99' }
                    ]} />
                  </View>
                  <Text style={[styles.barLabel, isActive && { color: theme.colors.text }]}>{d.day}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Top Areas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top areas scanning you</Text>
          <View style={styles.areaList}>
            {TOP_AREAS.map((a, i) => (
              <View key={i} style={styles.areaRow}>
                <View style={styles.areaLeft}>
                  <Text style={styles.areaRank}>#{i + 1}</Text>
                  <Text style={styles.areaName}>{a.area}</Text>
                </View>
                <View style={styles.areaBarWrap}>
                  <View style={[styles.areaBar, { width: `${a.pct * 100}%` }]} />
                </View>
                <Text style={styles.areaCount}>{a.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Coming Soon */}
        <View style={styles.comingSoon}>
          <Ionicons name="construct-outline" size={20} color={theme.colors.textDim} />
          <Text style={styles.comingSoonText}>Revenue & booking analytics coming soon</Text>
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 12,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 0.3,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  periodBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  periodBtnActive: {
    backgroundColor: theme.colors.primarySurface,
    borderColor: theme.colors.primaryBorder,
  },
  periodText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  periodTextActive: {
    color: theme.colors.primary,
  },
  scroll: {
    padding: theme.spacing.lg,
    gap: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: (width - theme.spacing.lg * 2 - 10) / 2,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: theme.colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statValue: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.text,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginRight: 6,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_HEIGHT + 40,
    paddingTop: 32,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: theme.colors.textDim,
    fontWeight: '600',
  },
  barTooltip: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'rgba(14,14,14,0.95)',
    borderWidth: 1,
    borderColor: theme.colors.primaryBorder,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  barTooltipText: {
    fontSize: 10,
    color: theme.colors.text,
    fontWeight: '600',
  },
  areaList: {
    gap: 12,
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  areaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 100,
  },
  areaRank: {
    fontSize: 11,
    color: theme.colors.textDim,
    fontWeight: '700',
    width: 22,
  },
  areaName: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: '600',
  },
  areaBarWrap: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  areaBar: {
    height: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  areaCount: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    fontWeight: '700',
    width: 28,
    textAlign: 'right',
  },
  comingSoon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 16,
  },
  comingSoonText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textDim,
    fontStyle: 'italic',
  },
});