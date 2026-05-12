// src/screens/marketplace/MarketplaceScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome as Icon } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Dummy data - will be replaced with API calls
const DUMMY_SHOPS = [
  {
    id: '1',
    name: 'Green Grocers',
    category: 'grocery',
    categoryName: 'Grocery',
    color: '#22C55E',
    rating: 4.5,
    distance: 0.8,
    isOpen: true,
    deliveryFee: 80,
    minOrder: 200,
    image: null,
    previewProducts: ['Fresh Tomatoes', 'Onions', 'Sukuma Wiki'],
    address: 'Karen Shopping Centre',
  },
  {
    id: '2',
    name: 'Mama Jo\'s Butchery',
    category: 'food',
    categoryName: 'Food',
    color: '#F97316',
    rating: 4.8,
    distance: 1.2,
    isOpen: true,
    deliveryFee: 100,
    minOrder: 300,
    image: null,
    previewProducts: ['Beef (1kg)', 'Chicken', 'Sausages'],
    address: 'Dagoreti Corner',
  },
  {
    id: '3',
    name: 'Quick Pharmacy',
    category: 'pharmacy',
    categoryName: 'Pharmacy',
    color: '#14B8A6',
    rating: 4.2,
    distance: 0.5,
    isOpen: true,
    deliveryFee: 50,
    minOrder: 0,
    image: null,
    previewProducts: ['Panadol', 'Vitamins', 'Face Masks'],
    address: 'Next to Shell Petrol',
  },
  {
    id: '4',
    name: 'Tech Hub Electronics',
    category: 'electronics',
    categoryName: 'Electronics',
    color: '#3B82F6',
    rating: 4.6,
    distance: 2.1,
    isOpen: true,
    deliveryFee: 120,
    minOrder: 500,
    image: null,
    previewProducts: ['Phone Charger', 'Earphones', 'Power Bank'],
    address: 'CBD, Moi Avenue',
  },
  {
    id: '5',
    name: 'Fashion Boutique',
    category: 'clothing',
    categoryName: 'Clothing',
    color: '#A855F7',
    rating: 4.3,
    distance: 1.8,
    isOpen: false,
    deliveryFee: 150,
    minOrder: 1000,
    image: null,
    previewProducts: ['Dresses', 'Shirts', 'Jeans'],
    address: 'The Hub Karen',
  },
  {
    id: '6',
    name: 'Hardware Centre',
    category: 'hardware',
    categoryName: 'Hardware',
    color: '#FF8C00',
    rating: 4.7,
    distance: 3.0,
    isOpen: true,
    deliveryFee: 200,
    minOrder: 500,
    image: null,
    previewProducts: ['Paint', 'Cement', 'Nails'],
    address: 'Lang\'ata Road',
  },
  {
    id: '7',
    name: 'Fresh Daily',
    category: 'grocery',
    categoryName: 'Grocery',
    color: '#22C55E',
    rating: 4.4,
    distance: 1.5,
    isOpen: true,
    deliveryFee: 80,
    minOrder: 150,
    image: null,
    previewProducts: ['Milk', 'Bread', 'Eggs'],
    address: 'Along Ngong Road',
  },
  {
    id: '8',
    name: 'Pizza Heaven',
    category: 'food',
    categoryName: 'Food',
    color: '#F97316',
    rating: 4.9,
    distance: 2.5,
    isOpen: true,
    deliveryFee: 150,
    minOrder: 600,
    image: null,
    previewProducts: ['Margherita', 'Pepperoni', 'Chicken BBQ'],
    address: 'Junction Mall',
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'th-large', color: '#22C55E' },
  { id: 'grocery', name: 'Grocery', icon: 'shopping-basket', color: '#22C55E' },
  { id: 'pharmacy', name: 'Pharmacy', icon: 'medkit', color: '#14B8A6' },
  { id: 'electronics', name: 'Electronics', icon: 'mobile', color: '#3B82F6' },
  { id: 'clothing', name: 'Clothing', icon: 'tshirt', color: '#A855F7' },
  { id: 'hardware', name: 'Hardware', icon: 'wrench', color: '#FF8C00' },
  { id: 'food', name: 'Food', icon: 'cutlery', color: '#F97316' },
];

const MarketplaceScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [shops, setShops] = useState(DUMMY_SHOPS);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartCount, setCartCount] = useState(0);

  const filterShops = () => {
    let filtered = DUMMY_SHOPS;
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(shop => shop.category === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(shop => 
        shop.name.toLowerCase().includes(query) ||
        shop.previewProducts.some(p => p.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setShops(DUMMY_SHOPS);
      setRefreshing(false);
    }, 1500);
  };

  const handleShopPress = (shop) => {
    Haptics.selectionAsync();
    // Navigate to shop detail - will implement later
    console.log('Open shop:', shop.name);
    // navigation.navigate('Shop', { shopId: shop.id });
  };

  const renderShopCard = ({ item: shop }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => handleShopPress(shop)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: shop.color + '15' }]}>
          <Icon name={getCategoryIcon(shop.category)} size={24} color={shop.color} />
        </View>
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{shop.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.rating}>
              <Icon name="star" size={12} color="#FBBF24" />
              <Text style={styles.ratingText}>{shop.rating}</Text>
            </View>
            <Text style={styles.dot}>•</Text>
            <Icon name="map-marker" size={10} color="#666" />
            <Text style={styles.distance}>{shop.distance}km</Text>
            <Text style={styles.dot}>•</Text>
            <View style={[styles.statusDot, { backgroundColor: shop.isOpen ? '#22C55E' : '#EF4444' }]} />
            <Text style={styles.status}>{shop.isOpen ? 'Open' : 'Closed'}</Text>
          </View>
        </View>
        <Icon name="chevron-right" size={16} color="#666" />
      </View>

      {shop.previewProducts && shop.previewProducts.length > 0 && (
        <View style={styles.productsRow}>
          <Text style={styles.productsLabel}>Popular:</Text>
          <Text style={styles.productsList} numberOfLines={1}>
            {shop.previewProducts.join(' • ')}
          </Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <View style={styles.deliveryInfo}>
          <Icon name="motorcycle" size={12} color="#22C55E" />
          <Text style={styles.deliveryText}>
            Delivery: {shop.deliveryFee === 0 ? 'Free' : `KES ${shop.deliveryFee}`}
          </Text>
          {shop.minOrder > 0 && (
            <Text style={styles.minOrderText}> • Min: KES {shop.minOrder}</Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => handleShopPress(shop)}
        >
          <Text style={styles.viewButtonText}>View Shop</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const filteredShops = filterShops();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.title}>Marketplace</Text>
        </View>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Icon name="shopping-cart" size={24} color="#22C55E" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartCount}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={16} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products or shops..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="times-circle" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.chip,
              activeCategory === item.id && styles.chipActive,
              { borderColor: item.color + '40' },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveCategory(item.id);
            }}
          >
            <Icon name={item.icon} size={14} color={item.color} />
            <Text
              style={[
                styles.chipText,
                activeCategory === item.id && styles.chipTextActive,
                { color: item.color },
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.chipsContainer}
      />

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredShops.length} {filteredShops.length === 1 ? 'shop' : 'shops'} near you
        </Text>
      </View>

      {/* Shops List */}
      <FlatList
        data={filteredShops}
        renderItem={renderShopCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22C55E" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="store" size={48} color="#333" />
            <Text style={styles.emptyText}>No shops found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your filters or search
            </Text>
          </View>
        }
      />
    </View>
  );
};

// Helper function
const getCategoryIcon = (category) => {
  const icons = {
    grocery: 'shopping-basket',
    pharmacy: 'medkit',
    electronics: 'mobile',
    clothing: 'tshirt',
    hardware: 'wrench',
    food: 'cutlery',
  };
  return icons[category] || 'store';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  greeting: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#22C55E',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  chipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    fontWeight: '700',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsCount: {
    fontSize: 12,
    color: '#666',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#FBBF24',
  },
  dot: {
    color: '#444',
    fontSize: 12,
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  status: {
    fontSize: 12,
    color: '#666',
  },
  productsRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  productsLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  productsList: {
    flex: 1,
    fontSize: 12,
    color: '#22C55E',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deliveryText: {
    fontSize: 11,
    color: '#22C55E',
  },
  minOrderText: {
    fontSize: 11,
    color: '#666',
  },
  viewButton: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
});

export default MarketplaceScreen;