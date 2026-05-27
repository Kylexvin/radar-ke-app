// src/screens/marketplace/ShopScreen.js
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Linking,
  Alert,
  ScrollView,
  Image,
  FlatList,
  StatusBar,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import theme from '../../utils/theme';

const { colors } = theme;
const { width, height } = Dimensions.get('window');
const GRID_GAP = 12;
const NUM_COLUMNS = 2;
const PRODUCT_CARD_WIDTH = (width - 32 - GRID_GAP) / NUM_COLUMNS;

// ─── PRODUCT CARD (GRID) ───────────────────────────────────────────────
const ProductCard = ({ item, providerColor, quantity, onAdd, onRemove }) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <View style={styles.productCard}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {}}
        style={styles.productCardTouch}
      >
        <View style={[styles.productImageWrapper, { backgroundColor: providerColor + '08' }]}>
          {item.image && !imageError ? (
            <Image 
              source={{ uri: item.image }} 
              style={styles.productImage}
              onError={() => setImageError(true)}
            />
          ) : (
            <Ionicons name="image-outline" size={32} color={providerColor + '40'} />
          )}
          {!item.isAvailable && (
            <View style={styles.productSoldOut}>
              <Text style={styles.productSoldOutText}>Out</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.productPriceRow}>
            <Text style={[styles.productPrice, { color: providerColor }]}>
              KES {item.price.toLocaleString()}
            </Text>
            {item.unit && <Text style={styles.productUnit}>/{item.unit}</Text>}
          </View>
        </View>
      </TouchableOpacity>
      
      {item.isAvailable && (
        quantity > 0 ? (
          <View style={[styles.productQtyControls, { backgroundColor: providerColor, borderColor: providerColor }]}>
            <TouchableOpacity onPress={onRemove} style={styles.productQtyBtn}>
              <Ionicons name="remove" size={12} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.productQtyText}>{quantity}</Text>
            <TouchableOpacity onPress={onAdd} style={styles.productQtyBtn}>
              <Ionicons name="add" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.productAddBtn, { backgroundColor: providerColor + '10', borderColor: providerColor + '30' }]}
            onPress={onAdd}
          >
            <Ionicons name="add" size={16} color={providerColor} />
          </TouchableOpacity>
        )
      )}
    </View>
  );
};

// ─── CATEGORY PILL ────────────────────────────────────────────────────
const CategoryPill = ({ label, isActive, color, onPress }) => (
  <TouchableOpacity
    style={[
      styles.categoryPill,
      isActive && { backgroundColor: color, borderColor: color }
    ]}
    onPress={onPress}
  >
    <Text style={[styles.categoryPillText, isActive && { color: '#fff' }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── MAIN SCREEN ──────────────────────────────────────────────────────
export default function ShopScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { shop } = route.params;
  
  // Extract unique categories
  const categories = ['all', ...new Set(shop.previewProducts?.map(p => p.category).filter(Boolean))];
  
  // Filter products
  const filteredProducts = shop.previewProducts?.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];
  
  const availableProducts = filteredProducts.filter(p => p.isAvailable !== false);
  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = shop.previewProducts?.find(p => p.id === id);
    return sum + (item?.price || 0) * qty;
  }, 0);
  
  // Header animations - shrink to very compact
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [90, 60],
    extrapolate: 'clamp',
  });
  
  const headerContentOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  const handleAddToCart = (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };
  
  const handleRemoveFromCart = (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart(prev => {
      const current = prev[item.id] || 0;
      if (current <= 1) {
        const { [item.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [item.id]: current - 1 };
    });
  };
  
  const handleWhatsApp = () => {
    const number = shop.whatsapp || shop.phone;
    if (!number) return Alert.alert('No Contact', 'WhatsApp number not available');
    Linking.openURL(`https://wa.me/${number.replace(/\D/g, '')}`);
  };
  
  const handleCall = () => {
    if (!shop.phone) return;
    Alert.alert('Contact Shop', shop.phone, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => Linking.openURL(`tel:${shop.phone}`) },
    ]);
  };
  
  const handleCheckout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate('Checkout', { cart, shop, cartTotal });
  };
  
  // Render header - NO extra space
  const renderHeader = () => (
    <Animated.View style={[styles.header, { height: headerHeight }]}>
      <View style={styles.headerTop}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn} onPress={handleCheckout}>
          <Ionicons name="cart-outline" size={20} color={colors.text} />
          {cartCount > 0 && (
            <View style={[styles.headerCartBadge, { backgroundColor: shop.color }]}>
              <Text style={styles.headerCartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <Animated.View style={[styles.headerContent, { opacity: headerContentOpacity }]}>
        <View style={[styles.shopIcon, { backgroundColor: shop.color + '15' }]}>
          <Ionicons name="storefront" size={24} color={shop.color} />
        </View>
        <View style={styles.shopInfo}>
          <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
          <View style={styles.shopMeta}>
            <View style={styles.shopRating}>
              <Ionicons name="star" size={10} color="#FBBF24" />
              <Text style={styles.shopRatingText}>{shop.rating}</Text>
            </View>
            <Text style={styles.shopMetaDot}>•</Text>
            <Text style={styles.shopDistance}>{shop.distance}</Text>
            <Text style={styles.shopMetaDot}>•</Text>
            <View style={[styles.shopStatus, shop.isOpen && styles.shopStatusOpen]}>
              <Text style={[styles.shopStatusText, shop.isOpen && { color: '#22C55E' }]}>
                {shop.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
  
  // Render sticky search & categories
  const renderStickyBar = () => (
    <View style={styles.stickyBar}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.textDim} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={colors.textFaint}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color={colors.textDim} />
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map(cat => (
          <CategoryPill
            key={cat}
            label={cat === 'all' ? 'All' : cat}
            isActive={activeCategory === cat}
            color={shop.color}
            onPress={() => setActiveCategory(cat)}
          />
        ))}
      </ScrollView>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {renderHeader()}
      {renderStickyBar()}
      
      <FlatList
        data={availableProducts}
        keyExtractor={item => item.id}
        numColumns={NUM_COLUMNS}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsGrid}
        columnWrapperStyle={styles.productsRow}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.textFaint} />
            <Text style={styles.emptyStateTitle}>No products found</Text>
            <Text style={styles.emptyStateText}>Try a different category or search term</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            providerColor={shop.color}
            quantity={cart[item.id] || 0}
            onAdd={() => handleAddToCart(item)}
            onRemove={() => handleRemoveFromCart(item)}
          />
        )}
      />
      
      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <TouchableOpacity 
          style={[styles.floatingCart, { backgroundColor: shop.color }]}
          onPress={handleCheckout}
          activeOpacity={0.9}
        >
          <View style={styles.floatingCartLeft}>
            <Ionicons name="cart" size={18} color="#fff" />
            <Text style={styles.floatingCartCount}>{cartCount}</Text>
          </View>
          <Text style={styles.floatingCartTotal}>KES {cartTotal.toLocaleString()}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      )}
      
      {/* Action Buttons - WhatsApp & Call */}
      <View style={[styles.actionButtons, { bottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.actionBtnWhatsapp} onPress={handleWhatsApp}>
          <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnCall} onPress={handleCall}>
          <Ionicons name="call-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header - Compact, no extra space
  header: {
    backgroundColor: colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 8,
    justifyContent: 'space-between',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  headerCartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  headerCartBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 8,
  },
  shopIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  shopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shopRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  shopRatingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FBBF24',
  },
  shopMetaDot: {
    fontSize: 10,
    color: colors.textDim,
  },
  shopDistance: {
    fontSize: 10,
    color: colors.textDim,
  },
  shopStatus: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  shopStatusOpen: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderColor: 'rgba(34,197,94,0.3)',
  },
  shopStatusText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textDim,
  },
  
  // Sticky Bar
  stickyBar: {
    backgroundColor: colors.background,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 10,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textDim,
  },
  
  // Products Grid
  productsGrid: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  productsRow: {
    justifyContent: 'space-between',
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  productCardTouch: {
    paddingBottom: 44,
  },
  productImageWrapper: {
    height: PRODUCT_CARD_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productSoldOut: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  productSoldOutText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#fff',
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 3,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '700',
  },
  productUnit: {
    fontSize: 9,
    color: colors.textDim,
  },
  productAddBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productQtyControls: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  productQtyBtn: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productQtyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    minWidth: 18,
    textAlign: 'center',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDim,
    marginTop: 12,
  },
  emptyStateText: {
    fontSize: 13,
    color: colors.textFaint,
    marginTop: 4,
  },
  
  // Floating Cart Button
  floatingCart: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  floatingCartCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  floatingCartTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  
  // Action Buttons (WhatsApp & Call)
  actionButtons: {
    position: 'absolute',
    right: 16,
    gap: 10,
  },
  actionBtnWhatsapp: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#25D36630',
  },
  actionBtnCall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
});

