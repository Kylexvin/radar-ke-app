// src/screens/provider/OrdersScreen.js
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

const FILTERS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

const DUMMY_ORDERS = [
  {
    id: 'ORD001', customer: 'John M.', items: 'Phone Screen Repair x1',
    amount: 'KSh 1,500', status: 'Pending', time: '10 min ago', area: 'Westlands',
  },
  {
    id: 'ORD002', customer: 'Amina K.', items: 'Battery Replacement x1',
    amount: 'KSh 800', status: 'Confirmed', time: '1h ago', area: 'Kilimani',
  },
  {
    id: 'ORD003', customer: 'Peter O.', items: 'Data Recovery x1',
    amount: 'KSh 3,500', status: 'Completed', time: '3h ago', area: 'Karen',
  },
  {
    id: 'ORD004', customer: 'Faith W.', items: 'Laptop Servicing x1',
    amount: 'KSh 2,000', status: 'Cancelled', time: 'Yesterday', area: 'Lavington',
  },
];

const STATUS_COLORS = {
  Pending: { bg: 'rgba(255,140,0,0.12)', text: theme.colors.warning },
  Confirmed: { bg: 'rgba(59,130,246,0.12)', text: theme.colors.info },
  Completed: { bg: 'rgba(34,197,94,0.12)', text: theme.colors.success },
  Cancelled: { bg: 'rgba(255,32,32,0.1)', text: theme.colors.error },
};

export default function OrdersScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? DUMMY_ORDERS
    : DUMMY_ORDERS.filter(o => o.status === activeFilter);

  const pendingCount = DUMMY_ORDERS.filter(o => o.status === 'Pending').length;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Orders</Text>
          {pendingCount > 0 && (
            <Text style={styles.headerSub}>{pendingCount} pending</Text>
          )}
        </View>
        <View style={styles.comingSoonBadge}>
          <Ionicons name="time-outline" size={12} color={theme.colors.warning} />
          <Text style={styles.comingSoonText}>Soon</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            {f !== 'All' && (
              <View style={[styles.filterCount, activeFilter === f && styles.filterCountActive]}>
                <Text style={[styles.filterCountText, activeFilter === f && { color: theme.colors.primary }]}>
                  {DUMMY_ORDERS.filter(o => o.status === f).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Coming soon banner */}
      <View style={styles.previewBanner}>
        <Ionicons name="construct-outline" size={14} color={theme.colors.warning} />
        <Text style={styles.previewText}>
          M-Pesa checkout integration coming soon. Orders shown are a preview.
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        {/* Summary cards */}
        <View style={styles.summaryRow}>
          {[
            { label: 'Today', value: 'KSh 2,300', icon: 'today-outline', color: theme.colors.primary },
            { label: 'This week', value: 'KSh 14,800', icon: 'calendar-outline', color: theme.colors.success },
          ].map((s, i) => (
            <View key={i} style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: s.color + '18' }]}>
                <Ionicons name={s.icon} size={16} color={s.color} />
              </View>
              <View>
                <Text style={styles.summaryValue}>{s.value}</Text>
                <Text style={styles.summaryLabel}>{s.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Orders list */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={32} color={theme.colors.textDim} />
            <Text style={styles.emptyTitle}>No {activeFilter.toLowerCase()} orders</Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {filtered.map((order, i) => {
              const sc = STATUS_COLORS[order.status];
              return (
                <TouchableOpacity
                  key={order.id}
                  style={[styles.orderCard, i === filtered.length - 1 && styles.orderCardLast]}
                  activeOpacity={0.8}
                >
                  <View style={styles.orderTop}>
                    <View style={styles.orderLeft}>
                      <Text style={styles.orderId}>{order.id}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                        <Text style={[styles.statusText, { color: sc.text }]}>{order.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.orderTime}>{order.time}</Text>
                  </View>
                  <Text style={styles.orderCustomer}>{order.customer} · {order.area}</Text>
                  <Text style={styles.orderItems} numberOfLines={1}>{order.items}</Text>
                  <View style={styles.orderBottom}>
                    <Text style={styles.orderAmount}>{order.amount}</Text>
                    {order.status === 'Pending' && (
                      <View style={styles.orderActions}>
                        <TouchableOpacity style={[styles.orderActionBtn, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
                          <Text style={[styles.orderActionText, { color: theme.colors.success }]}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.orderActionBtn, { backgroundColor: 'rgba(255,32,32,0.1)' }]}>
                          <Text style={[styles.orderActionText, { color: theme.colors.error }]}>Decline</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: theme.fontSizes.lg, fontWeight: '800', color: theme.colors.text },
  headerSub: { fontSize: theme.fontSizes.xs, color: theme.colors.warning },
  comingSoonBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,140,0,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,140,0,0.2)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  comingSoonText: { fontSize: 11, fontWeight: '700', color: theme.colors.warning },
  filterRow: {
    paddingHorizontal: theme.spacing.lg, paddingVertical: 12, gap: 8,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  filterBtnActive: { backgroundColor: theme.colors.primarySurface, borderColor: theme.colors.primaryBorder },
  filterText: { fontSize: theme.fontSizes.sm, fontWeight: '600', color: theme.colors.textMuted },
  filterTextActive: { color: theme.colors.primary },
  filterCount: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 5, paddingVertical: 1, borderRadius: 8,
  },
  filterCountActive: { backgroundColor: theme.colors.primarySurface },
  filterCountText: { fontSize: 10, fontWeight: '700', color: theme.colors.textDim },
  previewBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: theme.spacing.lg, paddingVertical: 9,
    backgroundColor: 'rgba(255,140,0,0.06)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,140,0,0.15)',
  },
  previewText: { flex: 1, fontSize: theme.fontSizes.sm, color: 'rgba(255,140,0,0.8)', fontWeight: '500' },
  scroll: { padding: theme.spacing.lg, gap: 14 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: 16, padding: 14,
  },
  summaryIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  summaryValue: { fontSize: theme.fontSizes.md, fontWeight: '800', color: theme.colors.text },
  summaryLabel: { fontSize: theme.fontSizes.xs, color: theme.colors.textDim, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyTitle: { fontSize: theme.fontSizes.md, color: theme.colors.textMuted, fontWeight: '600' },
  ordersList: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: 20, overflow: 'hidden',
  },
  orderCard: {
    padding: 16, gap: 6,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  orderCardLast: { borderBottomWidth: 0 },
  orderTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderId: { fontSize: theme.fontSizes.sm, fontWeight: '700', color: theme.colors.textMuted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  orderTime: { fontSize: 10, color: theme.colors.textDim },
  orderCustomer: { fontSize: theme.fontSizes.md, fontWeight: '700', color: theme.colors.text },
  orderItems: { fontSize: theme.fontSizes.sm, color: theme.colors.textMuted },
  orderBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  orderAmount: { fontSize: theme.fontSizes.md, fontWeight: '800', color: theme.colors.primary },
  orderActions: { flexDirection: 'row', gap: 8 },
  orderActionBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  orderActionText: { fontSize: theme.fontSizes.sm, fontWeight: '700' },
});