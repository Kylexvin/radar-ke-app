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
import { FontAwesome as Icon } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const DUMMY_SHOPS = [
  {
    id: '1',
    name: 'Green Grocers',
    category: 'grocery',
    color: '#22C55E',
    rating: 4.5,
    distance: 0.8,
    isOpen: true,
    deliveryFee: 80,
    minOrder: 200,
    previewProducts: ['Fresh Tomatoes', 'Onions', 'Sukuma Wiki', 'Eggs'],
    address: 'Karen Shopping Centre',
    emoji: '🛒',
  },
  {
    id: '2',
    name: "Mama Jo's Butchery",
    category: 'food',
    color: '#F97316',
    rating: 4.8,
    distance: 1.2,
    isOpen: true,
    deliveryFee: 100,
    minOrder: 300,
    previewProducts: ['Beef (1kg)', 'Chicken', 'Sausages', 'Goat Ribs'],
    address: 'Dagoreti Corner',
    emoji: '🍖',
  },
  {
    id: '3',
    name: 'Quick Pharmacy',
    category: 'pharmacy',
    color: '#14B8A6',
    rating: 4.2,
    distance: 0.5,
    isOpen: true,
    deliveryFee: 0,
    minOrder: 0,
    previewProducts: ['Panadol', 'Vitamins', 'Face Masks'],
    address: 'Next to Shell Petrol',
    emoji: '💊',
  },
  {
    id: '4',
    name: 'Tech Hub Electronics',
    category: 'electronics',
    color: '#3B82F6',
    rating: 4.6,
    distance: 2.1,
    isOpen: true,
    deliveryFee: 120,
    minOrder: 500,
    previewProducts: ['Phone Charger', 'Earphones', 'Power Bank'],
    address: 'CBD, Moi Avenue',
    emoji: '📱',
  },
  {
    id: '5',
    name: 'Fashion Boutique',
    category: 'clothing',
    color: '#A855F7',
    rating: 4.3,
    distance: 1.8,
    isOpen: false,
    deliveryFee: 150,
    minOrder: 1000,
    previewProducts: ['Dresses', 'Shirts', 'Jeans'],
    address: 'The Hub Karen',
    emoji: '👗',
  },
  {
    id: '6',
    name: 'Hardware Centre',
    category: 'hardware',
    color: '#FF8C00',
    rating: 4.7,
    distance: 3.0,
    isOpen: true,
    deliveryFee: 200,
    minOrder: 500,
    previewProducts: ['Paint', 'Cement', 'Nails'],
    address: "Lang'ata Road",
    emoji: '🔧',
  },
  {
    id: '7',
    name: 'Fresh Daily',
    category: 'grocery',
    color: '#22C55E',
    rating: 4.4,
    distance: 1.5,
    isOpen: true,
    deliveryFee: 80,
    minOrder: 150,
    previewProducts: ['Milk', 'Bread', 'Eggs'],
    address: 'Along Ngong Road',
    emoji: '🛒',
  },
  {
    id: '8',
    name: 'Pizza Heaven',
    category: 'food',
    color: '#F97316',
    rating: 4.9,
    distance: 2.5,
    isOpen: true,
    deliveryFee: 150,
    minOrder: 600,
    previewProducts: ['Margherita', 'Pepperoni', 'Chicken BBQ'],
    address: 'Junction Mall',
    emoji: '🍕',
  },
];

const CATEGORIES = [
  { id: 'all',         name: 'All',         color: '#22C55E' },
  { id: 'grocery',    name: 'Grocery',     color: '#22C55E' },
  { id: 'pharmacy',   name: 'Pharmacy',    color: '#14B8A6' },
  { id: 'electronics',name: 'Electronics', color: '#3B82F6' },
  { id: 'clothing',   name: 'Clothing',    color: '#A855F7' },
  { id: 'hardware',   name: 'Hardware',    color: '#FF8C00' },
  { id: 'food',       name: 'Food',        color: '#F97316' },
];

const MarketplaceScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing]       = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartCount]                       = useState(3);

  const filteredShops = useCallback(() => {
    let list = DUMMY_SHOPS;
    if (activeCategory !== 'all') {
      list = list.filter(s => s.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.previewProducts.some(p => p.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const handleShopPress = shop => {
    Haptics.selectionAsync();
    navigation.navigate('Shop', { shopId: shop.id });
  };

  // ─── HEADER ──────────────────────────────────────────────────────────────────
  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Marketplace</Text>
          <View style={styles.nearbyPill}>
            <Text style={styles.nearbyText}>{filteredShops().length} nearby</Text>
          </View>
        </View>
        <View style={styles.locRow}>
          <Icon name="map-marker" size={10} color="#22C55E" />
          <Text style={styles.locText}>Nairobi, KE</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.cartBtn}
        onPress={() => navigation.navigate('Cart')}
      >
        <Icon name="shopping-cart" size={19} color="#22C55E" />
        {cartCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartCount}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  // ─── CATEGORY CHIPS ───────────────────────────────────────────────────────────
  const renderChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsContainer}
    >
      {CATEGORIES.map(cat => (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.chip,
            activeCategory === cat.id && {
              backgroundColor: cat.color + '14',
              borderColor: cat.color + '50',
            },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            setActiveCategory(cat.id);
          }}
        >
          <View style={[styles.chipDot, { backgroundColor: cat.color }]} />
          <Text
            style={[
              styles.chipText,
              activeCategory === cat.id && { color: cat.color, fontWeight: '600' },
            ]}
          >
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // ─── SEARCH ───────────────────────────────────────────────────────────────────
  const renderSearch = () => (
    <View style={styles.searchBar}>
      <Icon name="search" size={14} color="#444" style={{ marginRight: 9 }} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search shops or products..."
        placeholderTextColor="#383838"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery !== '' && (
        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <Icon name="times-circle" size={14} color="#444" />
        </TouchableOpacity>
      )}
    </View>
  );

  // ─── RESULTS ROW ──────────────────────────────────────────────────────────────
  const renderResultsRow = () => (
    <View style={styles.resultsRow}>
      <Text style={styles.resultsCount}>
        {filteredShops().length} shops near you
      </Text>
      <TouchableOpacity style={styles.sortBtn}>
        <Icon name="sort" size={12} color="#22C55E" />
        <Text style={styles.sortText}>Nearest</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── SHOP CARD ────────────────────────────────────────────────────────────────
  const renderShopCard = ({ item: shop }) => (
    <TouchableOpacity
      style={[styles.card, !shop.isOpen && styles.cardClosed]}
      onPress={() => handleShopPress(shop)}
      activeOpacity={0.75}
    >
      {/* Top row */}
      <View style={styles.cardTop}>
        <View style={[styles.catIcon, { backgroundColor: shop.color + '14' }]}>
          <Text style={styles.catEmoji}>{shop.emoji}</Text>
        </View>
        <View style={styles.shopMeta}>
          <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
          <View style={styles.shopSub}>
            <Icon name="star" size={11} color="#FBBF24" />
            <Text style={styles.ratingText}>{shop.rating}</Text>
            <Text style={styles.sep}>•</Text>
            <Text style={styles.distText}>{shop.distance} km</Text>
            <Text style={styles.sep}>•</Text>
            <View
              style={[
                styles.statusPill,
                shop.isOpen ? styles.statusOpen : styles.statusClosed,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: shop.isOpen ? '#22C55E' : '#EF4444' },
                ]}
              >
                {shop.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>
          <View style={styles.addrRow}>
            <Icon name="map-marker" size={10} color="#2e2e2e" />
            <Text style={styles.addrText} numberOfLines={1}>{shop.address}</Text>
          </View>
        </View>
        <Icon name="chevron-right" size={14} color="#2a2a2a" />
      </View>

      {/* Product tags */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsContainer}
      >
        {shop.previewProducts.map((p, i) => (
          <View key={i} style={styles.tag}>
            <Text style={styles.tagText}>{p}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.deliveryRow}>
          <Icon name="motorcycle" size={13} color="#22C55E" />
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

  // ─── EMPTY STATE ──────────────────────────────────────────────────────────────
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="store" size={44} color="#222" />
      <Text style={styles.emptyTitle}>No shops found</Text>
      <Text style={styles.emptySub}>Try adjusting your filters or search</Text>
    </View>
  );

  const shops = filteredShops();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

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
            tintColor="#22C55E"
          />
        }
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
    color: '#fff',
    letterSpacing: -0.3,
  },
  nearbyPill: {
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  nearbyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22C55E',
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locText: {
    fontSize: 11,
    color: '#444',
  },
  cartBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#22C55E',
    borderRadius: 8,
    minWidth: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartCount: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000',
  },

  // ── Chips
  chipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 7,
    paddingBottom: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#222',
    marginRight: 7,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
  },

  // ── Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 11,
    marginHorizontal: 16,
    marginBottom: 10,
    height: 42,
    paddingHorizontal: 13,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#fff',
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
    color: '#3a3a3a',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  sortText: {
    fontSize: 11,
    color: '#22C55E',
  },

  // ── List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 9,
  },

  // ── Card
  card: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1d1d1d',
    borderRadius: 13,
    overflow: 'hidden',
  },
  cardClosed: {
    opacity: 0.65,
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
  catEmoji: {
    fontSize: 20,
  },
  shopMeta: {
    flex: 1,
    minWidth: 0,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 3,
  },
  shopSub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ratingText: {
    fontSize: 11,
    color: '#FBBF24',
  },
  sep: {
    color: '#2a2a2a',
    fontSize: 11,
  },
  distText: {
    fontSize: 11,
    color: '#444',
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 6,
  },
  statusOpen: {
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  statusClosed: {
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  addrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  addrText: {
    fontSize: 10,
    color: '#2e2e2e',
  },

  // ── Tags
  tagsContainer: {
    paddingHorizontal: 13,
    paddingBottom: 10,
    gap: 5,
  },
  tag: {
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#1d1d1d',
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginRight: 5,
  },
  tagText: {
    fontSize: 10,
    color: '#555',
  },

  // ── Card footer
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#161616',
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
    color: '#22C55E',
  },
  minText: {
    fontSize: 11,
    color: '#444',
  },
  viewBtn: {
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 5,
  },
  viewBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22C55E',
  },

  // ── Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#272727',
    marginTop: 4,
  },
});

export default MarketplaceScreen;