// src/screens/marketplace/MarketplaceScreen.js
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome as Icon } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import theme from '../../utils/theme';

const { colors } = theme;

// Dummy providers with hasShop/hasShowcase — replace with API call
// GET /api/scan/providers?hasShop=true&lat=...&lng=...
const DUMMY_PROVIDERS = [
  {
    id: '1',
    name: 'Green Grocers',
    category: 'grocery',
    categoryName: 'Grocery',
    color: '#22C55E',
    rating: 4.5,
    distance: '0.8km',
    isActive: true,
    isVerified: true,
    address: 'Karen Shopping Centre',
    phone: '+254712345678',
    whatsapp: '254712345678',
    description: 'Fresh vegetables and groceries delivered to your door.',
    radiusKm: 5,
    capabilities: { canBeContacted: true, hasShowcase: true, hasShop: true, takesBookings: false },
    showcaseItems: [
      { _id: 'i1', name: 'Fresh Tomatoes', price: 50, priceLabel: 'per kg', category: 'Vegetables', isAvailable: true },
      { _id: 'i2', name: 'Onions', price: 40, priceLabel: 'per kg', category: 'Vegetables', isAvailable: true },
      { _id: 'i3', name: 'Sukuma Wiki', price: 20, priceLabel: 'per bunch', category: 'Vegetables', isAvailable: true },
    ],
  },
  {
    id: '2',
    name: "Mama Jo's Butchery",
    category: 'food',
    categoryName: 'Food',
    color: '#F97316',
    rating: 4.8,
    distance: '1.2km',
    isActive: true,
    isVerified: true,
    address: 'Dagoreti Corner',
    phone: '+254723000001',
    whatsapp: '254723000001',
    description: 'Quality meat cuts, fresh daily.',
    radiusKm: 3,
    capabilities: { canBeContacted: true, hasShowcase: true, hasShop: true, takesBookings: false },
    showcaseItems: [
      { _id: 'i1', name: 'Beef (1kg)', price: 650, priceLabel: 'per kg', category: 'Red Meat', isAvailable: true },
      { _id: 'i2', name: 'Chicken', price: 550, priceLabel: 'whole', category: 'Poultry', isAvailable: true },
    ],
  },
  {
    id: '3',
    name: 'Quick Pharmacy',
    category: 'health',
    categoryName: 'Health',
    color: '#14B8A6',
    rating: 4.2,
    distance: '0.5km',
    isActive: true,
    isVerified: false,
    address: 'Next to Shell Petrol',
    phone: '+254711000003',
    whatsapp: '254711000003',
    description: 'Medicines and health products, fast delivery.',
    radiusKm: 4,
    capabilities: { canBeContacted: true, hasShowcase: true, hasShop: false, takesBookings: false },
    showcaseItems: [
      { _id: 'i1', name: 'Panadol', price: 50, priceLabel: 'per pack', category: 'Pain Relief', isAvailable: true },
      { _id: 'i2', name: 'Vitamin C', price: 350, priceLabel: 'per bottle', category: 'Supplements', isAvailable: true },
    ],
  },
  {
    id: '4',
    name: 'Tech Hub Electronics',
    category: 'fundi',
    categoryName: 'Electronics',
    color: '#3B82F6',
    rating: 4.6,
    distance: '2.1km',
    isActive: true,
    isVerified: true,
    address: 'CBD, Moi Avenue',
    phone: '+254700000004',
    whatsapp: '254700000004',
    description: 'Phone and laptop accessories, repairs.',
    radiusKm: 8,
    capabilities: { canBeContacted: true, hasShowcase: true, hasShop: true, takesBookings: false },
    showcaseItems: [
      { _id: 'i1', name: 'Phone Charger', price: 450, priceLabel: 'each', category: 'Accessories', isAvailable: true },
      { _id: 'i2', name: 'Power Bank', price: 2200, priceLabel: 'each', category: 'Power', isAvailable: true },
    ],
  },
];

const CATEGORIES = [
  { id: 'all',    name: 'All' },
  { id: 'food',   name: 'Food' },
  { id: 'health', name: 'Health' },
  { id: 'fundi',  name: 'Electronics' },
  { id: 'grocery', name: 'Grocery' },
];

const getCategoryIcon = (category) => {
  const map = {
    grocery: 'shopping-basket',
    health: 'medkit',
    fundi: 'mobile',
    food: 'cutlery',
    salon: 'scissors',
    delivery: 'motorcycle',
    bodaboda: 'motorcycle',
    tutor: 'book',
  };
  return map[category] || 'store';
};

export default function MarketplaceScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProviders = useCallback(() => {
    let list = DUMMY_PROVIDERS;
    if (activeCategory !== 'all') {
      list = list.filter(p => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.showcaseItems?.some(i => i.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const handleProviderPress = (provider) => {
    Haptics.selectionAsync();
    navigation.navigate('Shop', { provider });
  };

  const providers = filteredProviders();

  const renderCard = ({ item: provider }) => {
    const icon = getCategoryIcon(provider.category);
    const hasShop = provider.capabilities?.hasShop;
    const previewItems = provider.showcaseItems?.slice(0, 3) || [];

    return (
      <TouchableOpacity
        style={[styles.card, !provider.isActive && styles.cardClosed]}
        onPress={() => handleProviderPress(provider)}
        activeOpacity={0.75}
      >
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={[styles.providerIcon, { backgroundColor: provider.color + '18', borderColor: provider.color + '30' }]}>
            <Icon name={icon} size={20} color={provider.color} />
          </View>
          <View style={styles.providerMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.providerName} numberOfLines={1}>{provider.name}</Text>
              {provider.isVerified && (
                <Icon name="check-circle" size={11} color={colors.success} />
              )}
            </View>
            <View style={styles.metaSubRow}>
              <Icon name="star" size={10} color="#FBBF24" />
              <Text style={styles.ratingText}>{provider.rating}</Text>
              <Text style={styles.sep}>·</Text>
              <Icon name="map-marker" size={10} color={colors.textDim} />
              <Text style={styles.distText}>{provider.distance}</Text>
              <Text style={styles.sep}>·</Text>
              <View style={[styles.statusPill, { backgroundColor: provider.isActive ? 'rgba(34,197,94,0.1)' : colors.primarySurface }]}>
                <View style={[styles.statusDot, { backgroundColor: provider.isActive ? colors.success : colors.textDim }]} />
                <Text style={[styles.statusText, { color: provider.isActive ? colors.success : colors.textMuted }]}>
                  {provider.isActive ? 'Open' : 'Closed'}
                </Text>
              </View>
            </View>
            <View style={styles.addrRow}>
              <Icon name="map-marker" size={9} color={colors.textFaint} />
              <Text style={styles.addrText} numberOfLines={1}>{provider.address}</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={13} color={colors.textFaint} />
        </View>

        {/* Description */}
        {provider.description ? (
          <Text style={styles.providerDesc} numberOfLines={1}>{provider.description}</Text>
        ) : null}

        {/* Preview items */}
        {previewItems.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.previewRow}
          >
            {previewItems.map(item => (
              <View key={item._id} style={[styles.previewTag, { borderColor: provider.color + '30' }]}>
                <Text style={[styles.previewTagText, { color: provider.color }]}>{item.name}</Text>
                <Text style={styles.previewTagPrice}>KSh {item.price}</Text>
              </View>
            ))}
            {provider.showcaseItems?.length > 3 && (
              <View style={[styles.previewTag, { borderColor: colors.border }]}>
                <Text style={styles.previewTagMuted}>+{provider.showcaseItems.length - 3} more</Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.capRow}>
            {hasShop && (
              <View style={[styles.capChip, { backgroundColor: colors.primarySurface, borderColor: colors.primaryBorder }]}>
                <Icon name="shopping-cart" size={9} color={colors.primary} />
                <Text style={[styles.capChipText, { color: colors.primary }]}>Shop</Text>
              </View>
            )}
            {!hasShop && provider.capabilities?.hasShowcase && (
              <View style={[styles.capChip, { backgroundColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)' }]}>
                <Icon name="th-large" size={9} color="#3B82F6" />
                <Text style={[styles.capChipText, { color: '#3B82F6' }]}>Showcase</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.viewBtn, { backgroundColor: provider.color + '18', borderColor: provider.color + '35' }]}
            onPress={() => handleProviderPress(provider)}
          >
            <Text style={[styles.viewBtnText, { color: provider.color }]}>
              {hasShop ? 'View Shop' : 'View Showcase'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Marketplace</Text>
            <View style={styles.nearbyPill}>
              <Text style={styles.nearbyText}>{providers.length} nearby</Text>
            </View>
          </View>
          <View style={styles.locRow}>
            <Icon name="map-marker" size={10} color={colors.primary} />
            <Text style={styles.locText}>Nairobi, KE</Text>
          </View>
        </View>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, activeCategory === cat.id && styles.chipActive]}
            onPress={() => { Haptics.selectionAsync(); setActiveCategory(cat.id); }}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, activeCategory === cat.id && styles.chipTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search */}
      <View style={styles.searchBar}>
        <Icon name="search" size={13} color={colors.textDim} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search shops or products..."
          placeholderTextColor={colors.textFaint}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="times-circle" size={13} color={colors.textDim} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>{providers.length} shops near you</Text>
      </View>

      <FlatList
        data={providers}
        renderItem={renderCard}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="store" size={36} color={colors.textFaint} />
            <Text style={styles.emptyTitle}>No shops found</Text>
            <Text style={styles.emptySub}>Try adjusting your filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 16, paddingBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  nearbyPill: {
    backgroundColor: colors.primarySurface, borderWidth: 1,
    borderColor: colors.primaryBorder, borderRadius: 20,
    paddingHorizontal: 9, paddingVertical: 2,
  },
  nearbyText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  locText: { fontSize: 11, color: colors.textDim },
  chipsScroll: { height: 46, flexGrow: 0 },
  chipsContent: { paddingHorizontal: 16, alignItems: 'center', gap: 7 },
  chip: {
    paddingHorizontal: 14, height: 32, borderRadius: 20,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.primarySurface, borderColor: colors.primaryBorder },
  chipText: { fontSize: 12, fontWeight: '500', color: colors.textDim },
  chipTextActive: { fontWeight: '700', color: colors.primary },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 9,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 11, marginHorizontal: 16, marginBottom: 10,
    height: 42, paddingHorizontal: 13,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.text },
  resultsRow: { paddingHorizontal: 16, marginBottom: 8 },
  resultsText: { fontSize: 11, color: colors.textFaint },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },

  // Card
  card: {
    backgroundColor: colors.surface, borderWidth: 1,
    borderColor: colors.border, borderRadius: 16, overflow: 'hidden', gap: 0,
  },
  cardClosed: { opacity: 0.5 },
  cardTop: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, paddingBottom: 10,
  },
  providerIcon: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, flexShrink: 0,
  },
  providerMeta: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  providerName: { fontSize: 14, fontWeight: '700', color: colors.text, flex: 1 },
  metaSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 11, color: '#FBBF24', fontWeight: '600' },
  sep: { color: colors.textFaint, fontSize: 10 },
  distText: { fontSize: 11, color: colors.textDim },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '600' },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  addrText: { fontSize: 10, color: colors.textFaint },
  providerDesc: { fontSize: 12, color: colors.textDim, paddingHorizontal: 14, paddingBottom: 8, lineHeight: 17 },
  previewRow: { paddingHorizontal: 14, paddingBottom: 10, gap: 6 },
  previewTag: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, gap: 2,
    backgroundColor: colors.surface,
  },
  previewTagText: { fontSize: 11, fontWeight: '600' },
  previewTagPrice: { fontSize: 10, color: colors.textDim },
  previewTagMuted: { fontSize: 11, color: colors.textDim, fontWeight: '500' },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  capRow: { flexDirection: 'row', gap: 6 },
  capChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1,
  },
  capChipText: { fontSize: 10, fontWeight: '700' },
  viewBtn: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  viewBtnText: { fontSize: 11, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.textDim },
  emptySub: { fontSize: 12, color: colors.textFaint },
});