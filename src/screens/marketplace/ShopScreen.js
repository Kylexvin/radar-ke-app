// src/screens/marketplace/ShopScreen.js
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Linking,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome as Icon } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import theme from '../../utils/theme';

const { colors } = theme;
const { width } = Dimensions.get('window');
const PRODUCT_WIDTH = (width - 48 - 12) / 2;

// ─── DUMMY PRODUCTS PER SHOP ─────────────────────────────────────────────────
const DUMMY_PRODUCTS = {
  '1': [
    { id: 'p1', name: 'Fresh Tomatoes', category: 'Vegetables', price: 50, unit: 'per kg', inStock: true },
    { id: 'p2', name: 'Onions', category: 'Vegetables', price: 40, unit: 'per kg', inStock: true },
    { id: 'p3', name: 'Sukuma Wiki', category: 'Vegetables', price: 20, unit: 'per bunch', inStock: true },
    { id: 'p4', name: 'Eggs', category: 'Dairy', price: 180, unit: 'per tray', inStock: true },
    { id: 'p5', name: 'Carrots', category: 'Vegetables', price: 60, unit: 'per kg', inStock: false },
    { id: 'p6', name: 'Capsicum', category: 'Vegetables', price: 80, unit: 'per kg', inStock: true },
  ],
  '2': [
    { id: 'p1', name: 'Beef (1kg)', category: 'Red Meat', price: 650, unit: 'per kg', inStock: true },
    { id: 'p2', name: 'Chicken', category: 'Poultry', price: 550, unit: 'whole', inStock: true },
    { id: 'p3', name: 'Sausages', category: 'Processed', price: 280, unit: 'per pack', inStock: true },
    { id: 'p4', name: 'Goat Ribs', category: 'Red Meat', price: 700, unit: 'per kg', inStock: true },
  ],
  '3': [
    { id: 'p1', name: 'Panadol', category: 'Pain Relief', price: 50, unit: 'per pack', inStock: true },
    { id: 'p2', name: 'Vitamins C', category: 'Supplements', price: 350, unit: 'per bottle', inStock: true },
    { id: 'p3', name: 'Face Masks', category: 'Protection', price: 120, unit: 'per pack', inStock: true },
    { id: 'p4', name: 'Antiseptic', category: 'First Aid', price: 200, unit: 'per bottle', inStock: false },
  ],
  '4': [
    { id: 'p1', name: 'Phone Charger', category: 'Accessories', price: 450, unit: 'each', inStock: true },
    { id: 'p2', name: 'Earphones', category: 'Audio', price: 800, unit: 'each', inStock: true },
    { id: 'p3', name: 'Power Bank', category: 'Power', price: 2200, unit: 'each', inStock: true },
    { id: 'p4', name: 'USB Cable', category: 'Accessories', price: 250, unit: 'each', inStock: true },
  ],
  '5': [
    { id: 'p1', name: 'Summer Dress', category: 'Dresses', price: 2500, unit: 'each', inStock: true },
    { id: 'p2', name: 'Men\'s Shirt', category: 'Tops', price: 1800, unit: 'each', inStock: true },
    { id: 'p3', name: 'Jeans', category: 'Bottoms', price: 3200, unit: 'each', inStock: false },
  ],
  '6': [
    { id: 'p1', name: 'Paint (4L)', category: 'Painting', price: 1800, unit: 'per tin', inStock: true },
    { id: 'p2', name: 'Cement (50kg)', category: 'Building', price: 900, unit: 'per bag', inStock: true },
    { id: 'p3', name: 'Nails (1kg)', category: 'Fasteners', price: 150, unit: 'per kg', inStock: true },
    { id: 'p4', name: 'Wire Mesh', category: 'Building', price: 2400, unit: 'per roll', inStock: true },
  ],
  '7': [
    { id: 'p1', name: 'Milk (500ml)', category: 'Dairy', price: 55, unit: 'each', inStock: true },
    { id: 'p2', name: 'Bread', category: 'Bakery', price: 65, unit: 'per loaf', inStock: true },
    { id: 'p3', name: 'Eggs (30)', category: 'Dairy', price: 390, unit: 'per tray', inStock: true },
    { id: 'p4', name: 'Butter', category: 'Dairy', price: 180, unit: 'per pack', inStock: false },
  ],
  '8': [
    { id: 'p1', name: 'Margherita', category: 'Pizza', price: 850, unit: '12 inch', inStock: true },
    { id: 'p2', name: 'Pepperoni', category: 'Pizza', price: 1100, unit: '12 inch', inStock: true },
    { id: 'p3', name: 'Chicken BBQ', category: 'Pizza', price: 1050, unit: '12 inch', inStock: true },
    { id: 'p4', name: 'Garlic Bread', category: 'Sides', price: 280, unit: 'per order', inStock: true },
  ],
};

// Enrich shop with missing fields for dummy use
const enrichShop = (shop) => ({
  whatsapp: '254712345678',
  phone: '+254712345678',
  hours: 'Mon–Sat: 8am – 8pm\nSun: 10am – 6pm',
  deliveryRadiusKm: 5,
  totalRatings: 128,
  isVerified: true,
  tags: [shop.category, 'Nairobi', 'Delivery'],
  description: `Quality products from ${shop.name}. Fast delivery within ${shop.address}.`,
  icon: getCategoryIcon(shop.category),
  ...shop,
});

const getCategoryIcon = (category) => {
  const map = {
    grocery: 'shopping-basket',
    pharmacy: 'medkit',
    electronics: 'mobile',
    clothing: 'tshirt',
    hardware: 'wrench',
    food: 'cutlery',
  };
  return map[category] || 'store';
};

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
const ProductCard = ({ item, shopColor, onAdd, onRemove, quantity }) => (
  <View style={[styles.productCard, !item.inStock && styles.productCardDim]}>
    <View style={[styles.productIconBox, { backgroundColor: shopColor + '14' }]}>
      <Text style={styles.productEmoji}>📦</Text>
    </View>
    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
    <Text style={[styles.productCat, { color: shopColor + 'aa' }]}>{item.category}</Text>
    <View style={styles.productUnit}>
      <Text style={styles.productUnitText}>{item.unit}</Text>
    </View>
    <View style={styles.productBottom}>
      <Text style={styles.productPrice}>KES {item.price}</Text>
      {item.inStock ? (
        quantity > 0 ? (
          <View style={[styles.qtyRow, { borderColor: shopColor + '40' }]}>
            <TouchableOpacity onPress={() => onRemove(item)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Icon name="minus" size={9} color={shopColor} />
            </TouchableOpacity>
            <Text style={[styles.qtyText, { color: shopColor }]}>{quantity}</Text>
            <TouchableOpacity onPress={() => onAdd(item)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Icon name="plus" size={9} color={shopColor} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: shopColor + '18', borderColor: shopColor + '35' }]}
            onPress={() => onAdd(item)}
            activeOpacity={0.75}
          >
            <Icon name="plus" size={11} color={shopColor} />
          </TouchableOpacity>
        )
      ) : (
        <Text style={styles.outOfStock}>Out</Text>
      )}
    </View>
  </View>
);

// ─── SCREEN ───────────────────────────────────────────────────────────────────
export default function ShopScreen({ route, navigation }) {
  const rawShop = route?.params?.shop;
  const insets = useSafeAreaInsets();

  // Safety guard
  if (!rawShop) {
    return (
      <View style={styles.errorScreen}>
        <Icon name="exclamation-circle" size={36} color={colors.primary} />
        <Text style={styles.errorText}>Shop not found</Text>
        <TouchableOpacity style={styles.errorBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.errorBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const shop = enrichShop(rawShop);
  const products = DUMMY_PRODUCTS[shop.id] ?? [];
  const [activeTab, setActiveTab] = useState('products');
  const [cart, setCart] = useState({});
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerBg = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: ['rgba(12,12,12,0)', 'rgba(12,12,12,0.98)'],
    extrapolate: 'clamp',
  });

  const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);

  const getQuantity = (id) => cart[id] ?? 0;

  const handleAdd = useCallback((product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart(prev => ({ ...prev, [product.id]: (prev[product.id] ?? 0) + 1 }));
  }, []);

  const handleRemove = useCallback((product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart(prev => {
      const current = prev[product.id] ?? 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[product.id];
        return next;
      }
      return { ...prev, [product.id]: current - 1 };
    });
  }, []);

  const handleWhatsApp = () => {
    const num = shop.whatsapp.replace(/\D/g, '');
    Linking.openURL(`whatsapp://send?phone=${num}`).catch(() =>
      Linking.openURL(`https://wa.me/${num}`)
    );
  };

  const handleCall = () => Linking.openURL(`tel:${shop.phone}`);

  const tabs = [
    { id: 'products', label: `Products (${products.length})` },
    { id: 'info',     label: 'Info' },
  ];

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>

      {/* ── STICKY TOP BAR */}
      <Animated.View style={[styles.topBar, { backgroundColor: headerBg, paddingTop: insets.top + 6 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={16} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{shop.name}</Text>
        <TouchableOpacity
          style={[styles.topCartBtn, { borderColor: shop.color + '40' }]}
          onPress={() => navigation.navigate('Cart')}
        >
          <Icon name="shopping-cart" size={14} color={shop.color} />
          {cartCount > 0 && (
            <View style={[styles.topCartBadge, { backgroundColor: shop.color }]}>
              <Text style={styles.topCartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── HERO */}
        <View style={[styles.hero, { paddingTop: insets.top + 60 }]}>
          <View style={[styles.heroIconBox, { backgroundColor: shop.color + '14', borderColor: shop.color + '30' }]}>
            <Text style={{ fontSize: 36 }}>{shop.emoji}</Text>
          </View>

          <View style={styles.heroBody}>
            {/* Name + verified */}
            <View style={styles.heroNameRow}>
              <Text style={styles.heroName}>{shop.name}</Text>
              {shop.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Icon name="check-circle" size={11} color="#22C55E" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>

            <Text style={styles.heroDesc} numberOfLines={2}>{shop.description}</Text>

            {/* Meta chips */}
            <View style={styles.metaRow}>
              <View style={[
                styles.metaChip,
                { borderColor: shop.isOpen ? 'rgba(34,197,94,0.3)' : colors.border },
              ]}>
                <View style={[styles.metaDot, { backgroundColor: shop.isOpen ? '#22C55E' : colors.textFaint }]} />
                <Text style={[styles.metaChipText, { color: shop.isOpen ? '#22C55E' : colors.textDim }]}>
                  {shop.isOpen ? 'Open' : 'Closed'}
                </Text>
              </View>
              <View style={styles.metaChip}>
                <Icon name="map-marker" size={10} color={colors.textDim} />
                <Text style={styles.metaChipText}>{shop.distance} km away</Text>
              </View>
              <View style={styles.metaChip}>
                <Icon name="star" size={10} color="#FBBF24" />
                <Text style={styles.metaChipText}>{shop.rating} ({shop.totalRatings})</Text>
              </View>
            </View>

            {/* Delivery chips */}
            <View style={styles.deliveryRow}>
              <View style={[styles.deliveryChip, { backgroundColor: shop.color + '12' }]}>
                <Icon name="motorcycle" size={10} color={shop.color} />
                <Text style={[styles.deliveryChipText, { color: shop.color }]}>
                  {shop.deliveryFee === 0 ? 'Free delivery' : `KES ${shop.deliveryFee} delivery`}
                </Text>
              </View>
              {shop.minOrder > 0 && (
                <View style={[styles.deliveryChip, { backgroundColor: colors.surface }]}>
                  <Icon name="shopping-basket" size={10} color={colors.textDim} />
                  <Text style={styles.deliveryChipMuted}>Min KES {shop.minOrder}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ── ACTION BUTTONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#25D36618', borderColor: '#25D36635' }]}
            onPress={handleWhatsApp}
            activeOpacity={0.8}
          >
            <Icon name="whatsapp" size={15} color="#25D366" />
            <Text style={[styles.actionBtnText, { color: '#25D366' }]}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primarySurface, borderColor: colors.primaryBorder }]}
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <Icon name="phone" size={14} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <Icon name="map-o" size={14} color={colors.textDim} />
            <Text style={[styles.actionBtnText, { color: colors.textDim }]}>Directions</Text>
          </TouchableOpacity>
        </View>

        {/* ── TABS */}
        <View style={styles.tabRow}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && { borderBottomColor: shop.color, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && { color: shop.color }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── TAB CONTENT */}
        {activeTab === 'products' ? (
          products.length > 0 ? (
            <View style={styles.productGrid}>
              {products.map(item => (
                <View key={item.id} style={styles.productCol}>
                  <ProductCard
                    item={item}
                    shopColor={shop.color}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    quantity={getQuantity(item.id)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyProducts}>
              <Icon name="cube" size={36} color={colors.textFaint} />
              <Text style={styles.emptyProductsText}>No products listed yet</Text>
            </View>
          )
        ) : (
          <View style={styles.infoSection}>
            {[
              { icon: 'clock-o',   label: 'Hours',           value: shop.hours },
              { icon: 'map-marker',label: 'Address',          value: shop.address },
              { icon: 'motorcycle',label: 'Delivery Radius',  value: `${shop.deliveryRadiusKm} km from shop` },
              { icon: 'phone',     label: 'Phone',            value: shop.phone },
            ].map(row => (
              <View key={row.label} style={styles.infoRow}>
                <View style={[styles.infoIconWrap, { backgroundColor: shop.color + '12' }]}>
                  <Icon name={row.icon} size={13} color={shop.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <Text style={styles.infoValue}>{row.value}</Text>
                </View>
              </View>
            ))}

            <View style={styles.tagsWrap}>
              {shop.tags.map(tag => (
                <View key={tag} style={[styles.tag, { backgroundColor: shop.color + '14', borderColor: shop.color + '30' }]}>
                  <Text style={[styles.tagText, { color: shop.color }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Animated.ScrollView>

      {/* ── FLOATING CART BAR */}
      {cartCount > 0 && (
        <View style={[styles.cartBar, { bottom: insets.bottom + 16 }]}>
          <View style={styles.cartBarLeft}>
            <View style={[styles.cartBarBadge, { backgroundColor: shop.color }]}>
              <Text style={styles.cartBarBadgeText}>{cartCount}</Text>
            </View>
            <Text style={styles.cartBarLabel}>
              {cartCount} item{cartCount > 1 ? 's' : ''} in cart
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.cartBarBtn, { backgroundColor: shop.color }]}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.85}
          >
            <Text style={styles.cartBarBtnText}>View Cart</Text>
            <Icon name="chevron-right" size={12} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Error fallback
  errorScreen: {
    flex: 1, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  errorText: { fontSize: 16, color: colors.textMuted, fontWeight: '600' },
  errorBtn: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: colors.primarySurface, borderRadius: 12,
    borderWidth: 1, borderColor: colors.primaryBorder,
  },
  errorBtnText: { fontSize: 13, color: colors.primaryLight, fontWeight: '600' },

  // ── Top bar
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingBottom: 12, gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: 'rgba(12,12,12,0.85)',
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1, fontSize: 15, fontWeight: '700', color: colors.text,
  },
  topCartBtn: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: 'rgba(12,12,12,0.85)',
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  topCartBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  topCartBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },

  // ── Hero
  hero: {
    paddingHorizontal: 16, paddingBottom: 20, gap: 16,
  },
  heroIconBox: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, alignSelf: 'flex-start',
  },
  heroBody: { gap: 8 },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  heroName: { fontSize: 22, fontWeight: '800', color: colors.text },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: 11, color: '#22C55E', fontWeight: '600' },
  heroDesc: { fontSize: 13, color: colors.textDim, lineHeight: 19 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  metaDot: { width: 6, height: 6, borderRadius: 3 },
  metaChipText: { fontSize: 11, color: colors.textDim, fontWeight: '500' },
  deliveryRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  deliveryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  deliveryChipText: { fontSize: 11, fontWeight: '600' },
  deliveryChipMuted: { fontSize: 11, color: colors.textDim },

  // ── Actions
  actions: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingBottom: 20,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    paddingVertical: 11, borderRadius: 12, borderWidth: 1,
  },
  actionBtnText: { fontSize: 12, fontWeight: '600' },

  // ── Tabs
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: colors.border,
    marginBottom: 4,
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textDim },

  // ── Products
  productGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, paddingTop: 12, gap: 12,
  },
  productCol: { width: PRODUCT_WIDTH },
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: 13, borderWidth: 1,
    borderColor: colors.border,
    padding: 12, gap: 5,
  },
  productCardDim: { opacity: 0.45 },
  productIconBox: {
    width: 44, height: 44, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
  productEmoji: { fontSize: 22 },
  productName: { fontSize: 12, fontWeight: '600', color: colors.text, lineHeight: 16 },
  productCat: { fontSize: 10, fontWeight: '500' },
  productUnit: { marginTop: 1 },
  productUnitText: { fontSize: 9, color: colors.textFaint },
  productBottom: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 4,
  },
  productPrice: { fontSize: 13, fontWeight: '700', color: colors.text },
  addBtn: {
    width: 26, height: 26, borderRadius: 8,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  qtyText: { fontSize: 12, fontWeight: '800', minWidth: 14, textAlign: 'center' },
  outOfStock: { fontSize: 9, color: colors.textFaint, fontWeight: '600' },
  emptyProducts: {
    alignItems: 'center', paddingVertical: 48, gap: 10,
  },
  emptyProductsText: { fontSize: 14, color: colors.textDim },

  // ── Info tab
  infoSection: { paddingHorizontal: 16, paddingTop: 16, gap: 0 },
  infoRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  infoIconWrap: {
    width: 32, height: 32, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { fontSize: 10, color: colors.textFaint, fontWeight: '500', marginBottom: 2 },
  infoValue: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 14 },
  tag: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1,
  },
  tagText: { fontSize: 11, fontWeight: '600' },

  // ── Cart bar
  cartBar: {
    position: 'absolute', left: 16, right: 16,
    backgroundColor: 'rgba(14,14,16,0.97)',
    borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 14, paddingRight: 6, paddingVertical: 8,
  },
  cartBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartBarBadge: {
    width: 26, height: 26, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  cartBarBadgeText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  cartBarLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  cartBarBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
  },
  cartBarBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});