// src/screens/marketplace/MarketplaceScreen.js
import React, { useState, useCallback } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import theme from '../../utils/theme';

const { colors } = theme;

// All shops with full e-commerce capabilities
const DUMMY_SHOPS = [
  {
    id: '1',
    name: 'Green Grocers',
    category: 'grocery',
    categoryName: 'Grocery',
    color: '#22C55E',
    rating: 4.5,
    distance: '0.8km',
    isOpen: true,
    isVerified: true,
    address: 'Karen Shopping Centre',
    phone: '+254712345678',
    whatsapp: '254712345678',
    description: 'Fresh vegetables and groceries delivered to your door.',
    deliveryFee: 80,
    minOrder: 200,
    previewProducts: [
      { id: 'p1', name: 'Fresh Tomatoes', price: 50, unit: 'per kg' },
      { id: 'p2', name: 'Onions', price: 40, unit: 'per kg' },
      { id: 'p3', name: 'Sukuma Wiki', price: 20, unit: 'per bunch' },
    ],
  },
  {
    id: '2',
    name: "Mama Jo's Butchery",
    category: 'food',
    categoryName: 'Food & Restaurant',
    color: '#F97316',
    rating: 4.8,
    distance: '1.2km',
    isOpen: true,
    isVerified: true,
    address: 'Dagoreti Corner',
    phone: '+254723000001',
    whatsapp: '254723000001',
    description: 'Quality meat cuts, fresh daily.',
    deliveryFee: 100,
    minOrder: 300,
    previewProducts: [
      { id: 'p1', name: 'Beef (1kg)', price: 650, unit: 'per kg' },
      { id: 'p2', name: 'Chicken', price: 550, unit: 'whole' },
    ],
  },
  {
    id: '3',
    name: 'Quick Pharmacy',
    category: 'health',
    categoryName: 'Health & Pharmacy',
    color: '#14B8A6',
    rating: 4.2,
    distance: '0.5km',
    isOpen: true,
    isVerified: false,
    address: 'Next to Shell Petrol',
    phone: '+254711000003',
    whatsapp: '254711000003',
    description: 'Medicines and health products, fast delivery.',
    deliveryFee: 0,
    minOrder: 0,
    previewProducts: [
      { id: 'p1', name: 'Panadol', price: 50, unit: 'per pack' },
      { id: 'p2', name: 'Vitamin C', price: 350, unit: 'per bottle' },
    ],
  },
  {
    id: '4',
    name: 'Tech Hub Electronics',
    category: 'electronics',
    categoryName: 'Electronics',
    color: '#3B82F6',
    rating: 4.6,
    distance: '2.1km',
    isOpen: true,
    isVerified: true,
    address: 'CBD, Moi Avenue',
    phone: '+254700000004',
    whatsapp: '254700000004',
    description: 'Phone and laptop accessories, repairs.',
    deliveryFee: 120,
    minOrder: 500,
    previewProducts: [
      { id: 'p1', name: 'Phone Charger', price: 450, unit: 'each' },
      { id: 'p2', name: 'Power Bank', price: 2200, unit: 'each' },
    ],
  },
  {
    id: '5',
    name: 'Fashion Boutique',
    category: 'clothing',
    categoryName: 'Clothing',
    color: '#A855F7',
    rating: 4.3,
    distance: '1.8km',
    isOpen: false,
    isVerified: true,
    address: 'The Hub Karen',
    phone: '+254722000005',
    whatsapp: '254722000005',
    description: 'Trendy fashion wear for all occasions.',
    deliveryFee: 150,
    minOrder: 1000,
    previewProducts: [
      { id: 'p1', name: 'Dresses', price: 1500, unit: 'each' },
      { id: 'p2', name: 'Shirts', price: 800, unit: 'each' },
    ],
  },
  {
    id: '6',
    name: 'Hardware Centre',
    category: 'hardware',
    categoryName: 'Hardware',
    color: '#FF8C00',
    rating: 4.7,
    distance: '3.0km',
    isOpen: true,
    isVerified: true,
    address: "Lang'ata Road",
    phone: '+254733000006',
    whatsapp: '254733000006',
    description: 'Building materials and hardware supplies.',
    deliveryFee: 200,
    minOrder: 500,
    previewProducts: [
      { id: 'p1', name: 'Paint', price: 1200, unit: 'per gallon' },
      { id: 'p2', name: 'Cement', price: 650, unit: 'per bag' },
    ],
  },
];

const CATEGORIES = [
  { id: 'all',         name: 'All',         color: '#FF4444', icon: 'apps-outline' },
  { id: 'grocery',     name: 'Grocery',     color: '#22C55E', icon: 'cart-outline' },
  { id: 'health',      name: 'Pharmacy',    color: '#14B8A6', icon: 'medkit-outline' },
  { id: 'electronics', name: 'Electronics', color: '#3B82F6', icon: 'phone-portrait-outline' },
  { id: 'clothing',    name: 'Clothing',    color: '#A855F7', icon: 'shirt-outline' },
  { id: 'hardware',    name: 'Hardware',    color: '#FF8C00', icon: 'construct-outline' },
  { id: 'food',        name: 'Food',        color: '#F97316', icon: 'restaurant-outline' },
];

const getCategoryIcon = (category) => {
  const map = {
    grocery: 'cart-outline',
    health: 'medkit-outline',
    electronics: 'phone-portrait-outline',
    food: 'restaurant-outline',
    clothing: 'shirt-outline',
    hardware: 'construct-outline',
  };
  return map[category] || 'storefront-outline';
};

export default function MarketplaceScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredShops = useCallback(() => {
    let list = DUMMY_SHOPS;
    if (activeCategory !== 'all') {
      list = list.filter(shop => shop.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(shop =>
        shop.name.toLowerCase().includes(q) ||
        shop.description?.toLowerCase().includes(q) ||
        shop.previewProducts?.some(p => p.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const handleShopPress = (shop) => {
    Haptics.selectionAsync();
    navigation.navigate('Shop', { shop });
  };

  const shops = filteredShops();

  // ─── HEADER ──────────────────────────────────────────────────────────────────
  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Marketplace</Text>
          <View style={styles.nearbyPill}>
            <Text style={styles.nearbyText}>{shops.length} nearby</Text>
          </View>
        </View>
        <View style={styles.locRow}>
          <Ionicons name="location-outline" size={10} color={colors.primary} />
          <Text style={styles.locText}>Nairobi, KE</Text>
        </View>
      </View>
    </View>
  );

  // ─── CATEGORY CHIPS ──────────────────────────────────────────────────────────
  const renderChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipsScroll}
      contentContainerStyle={styles.chipsContainer}
    >
      {CATEGORIES.map(cat => (
        <TouchableOpacity
          key={cat.id}
          style={[styles.chip, activeCategory === cat.id && styles.chipActive]}
          onPress={() => {
            Haptics.selectionAsync();
            setActiveCategory(cat.id);
          }}
        >
          <Ionicons 
            name={cat.icon} 
            size={12} 
            color={activeCategory === cat.id ? colors.primaryLight : colors.textDim} 
          />
          <Text style={[styles.chipText, activeCategory === cat.id && styles.chipTextActive]}>
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // ─── SEARCH ──────────────────────────────────────────────────────────────────
  const renderSearch = () => (
    <View style={styles.searchBar}>
      <Ionicons name="search-outline" size={16} color={colors.textDim} style={{ marginRight: 9 }} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search shops or products..."
        placeholderTextColor={colors.textFaint}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery !== '' && (
        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <Ionicons name="close-circle-outline" size={16} color={colors.textDim} />
        </TouchableOpacity>
      )}
    </View>
  );

  // ─── RESULTS ROW ─────────────────────────────────────────────────────────────
  const renderResultsRow = () => (
    <View style={styles.resultsRow}>
      <Text style={styles.resultsCount}>
        {shops.length} shops near you
      </Text>
      <TouchableOpacity style={styles.sortBtn}>
        <Ionicons name="funnel-outline" size={12} color={colors.primaryLight} />
        <Text style={styles.sortText}>Nearest</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── SHOP CARD ───────────────────────────────────────────────────────────────
  const renderShopCard = ({ item: shop }) => {
    const icon = getCategoryIcon(shop.category);
    const previewItems = shop.previewProducts?.slice(0, 3) || [];

    return (
      <TouchableOpacity
        style={[styles.card, !shop.isOpen && styles.cardClosed]}
        onPress={() => handleShopPress(shop)}
        activeOpacity={0.75}
      >
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={[styles.catIcon, { backgroundColor: shop.color + '14' }]}>
            <Ionicons name={icon} size={22} color={shop.color} />
          </View>
          <View style={styles.shopMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
              {shop.isVerified && (
                <Ionicons name="checkmark-circle" size={12} color="#22C55E" />
              )}
            </View>
            <View style={styles.shopSub}>
              <Ionicons name="star" size={11} color="#FBBF24" />
              <Text style={styles.ratingText}>{shop.rating}</Text>
              <Text style={styles.sep}>•</Text>
              <Text style={styles.distText}>{shop.distance}</Text>
              <Text style={styles.sep}>•</Text>
              <View style={[styles.statusPill, shop.isOpen ? styles.statusOpen : styles.statusClosed]}>
                <Text style={[styles.statusText, { color: shop.isOpen ? '#22C55E' : colors.primary }]}>
                  {shop.isOpen ? 'Open' : 'Closed'}
                </Text>
              </View>
            </View>
            <View style={styles.addrRow}>
              <Ionicons name="location-outline" size={10} color={colors.textFaint} />
              <Text style={styles.addrText} numberOfLines={1}>{shop.address}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={14} color={colors.textFaint} />
        </View>

        {/* Description */}
        {shop.description && (
          <Text style={styles.shopDesc} numberOfLines={1}>{shop.description}</Text>
        )}

        {/* Preview products */}
        {previewItems.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContainer}
          >
            {previewItems.map(item => (
              <View key={item.id} style={styles.tag}>
                <Text style={styles.tagText}>{item.name}</Text>
                <Text style={styles.tagPrice}>KES {item.price}</Text>
              </View>
            ))}
            {shop.previewProducts?.length > 3 && (
              <View style={styles.tag}>
                <Text style={styles.tagMuted}>+{shop.previewProducts.length - 3} more</Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* Footer - Delivery info */}
        <View style={styles.cardFooter}>
          <View style={styles.deliveryRow}>
            <Ionicons name="bicycle-outline" size={13} color={colors.primary} />
            <Text style={styles.feeText}>
              {shop.deliveryFee === 0 ? 'Free delivery' : `KES ${shop.deliveryFee}`}
            </Text>
            {shop.deliveryFee > 0 && shop.minOrder > 0 && (
              <>
                <Text style={styles.sep}>•</Text>
                <Text style={styles.minText}>Min KES {shop.minOrder}</Text>
              </>
            )}
          </View>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => handleShopPress(shop)}
          >
            <Text style={styles.viewBtnText}>View Shop</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── EMPTY STATE ─────────────────────────────────────────────────────────────
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="storefront-outline" size={48} color={colors.textFaint} />
      <Text style={styles.emptyTitle}>No shops found</Text>
      <Text style={styles.emptySub}>Try adjusting your filters or search</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      {renderHeader()}
      {renderChips()}
      {renderSearch()}
      {renderResultsRow()}
      <FlatList
        data={shops}
        renderItem={renderShopCard}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  nearbyPill: {
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  nearbyText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locText: {
    fontSize: 11,
    color: colors.textDim,
  },

  // ── Chips
  chipsScroll: {
    height: 46,
    marginBottom: 6,
    flexGrow: 0,
    flexShrink: 0,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 7,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primaryBorder,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textDim,
  },
  chipTextActive: {
    fontWeight: '600',
    color: colors.primaryLight,
  },

  // ── Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    marginHorizontal: 16,
    marginBottom: 10,
    height: 42,
    paddingHorizontal: 13,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },

  // ── Results row
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 11,
    color: colors.textFaint,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  sortText: {
    fontSize: 11,
    color: colors.primaryLight,
  },

  // ── List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 9,
  },

  // ── Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    overflow: 'hidden',
  },
  cardClosed: {
    opacity: 0.55,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
    paddingBottom: 10,
  },
  catIcon: {
    width: 44,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  shopMeta: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  shopSub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 11,
    color: '#FBBF24',
  },
  sep: {
    color: colors.border,
    fontSize: 11,
  },
  distText: {
    fontSize: 11,
    color: colors.textDim,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 6,
  },
  statusOpen: {
    backgroundColor: 'rgba(34,197,94,0.1)',
  },
  statusClosed: {
    backgroundColor: colors.primarySurface,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  addrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  addrText: {
    fontSize: 10,
    color: colors.textFaint,
  },
  shopDesc: {
    fontSize: 11,
    color: colors.textDim,
    paddingHorizontal: 13,
    paddingBottom: 8,
  },

  // ── Tags
  tagsContainer: {
    paddingHorizontal: 13,
    paddingBottom: 10,
    gap: 5,
  },
  tag: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginRight: 5,
    gap: 2,
  },
  tagText: {
    fontSize: 10,
    color: colors.textDim,
    fontWeight: '500',
  },
  tagPrice: {
    fontSize: 9,
    color: colors.textFaint,
  },
  tagMuted: {
    fontSize: 10,
    color: colors.textDim,
  },

  // ── Card footer
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  feeText: {
    fontSize: 11,
    color: colors.primary,
  },
  minText: {
    fontSize: 11,
    color: colors.textDim,
  },
  viewBtn: {
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 5,
  },
  viewBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryLight,
  },

  // ── Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDim,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textFaint,
    marginTop: 4,
  },
});