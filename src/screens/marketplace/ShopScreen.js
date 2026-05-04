// src/screens/marketplace/ShopScreen.js
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome as Icon } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import theme from '../../utils/theme';
import { DUMMY_PRODUCTS } from './constants';
import { useCart } from './CartContext';

const { width } = Dimensions.get('window');
const PRODUCT_COLS = 2;
const PRODUCT_WIDTH = (width - 48 - 12) / PRODUCT_COLS;

const ProductCard = ({ item, shopColor, onAdd, quantity }) => (
  <View style={[styles.productCard, !item.inStock && { opacity: 0.5 }]}>
    <View style={[styles.productIcon, { backgroundColor: shopColor + '18' }]}>
      <Icon name="cube" size={22} color={shopColor} />
    </View>
    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
    <Text style={[styles.productCat, { color: shopColor + 'aa' }]}>{item.category}</Text>
    <View style={styles.productBottom}>
      <Text style={styles.productPrice}>KES {item.price}</Text>
      {item.inStock ? (
        quantity > 0 ? (
          <View style={[styles.qtyBadge, { backgroundColor: shopColor + '22', borderColor: shopColor + '40' }]}>
            <Text style={[styles.qtyText, { color: shopColor }]}>{quantity}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: shopColor + '20', borderColor: shopColor + '40' }]}
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

export default function ShopScreen({ route, navigation }) {
  const { shop } = route.params;
  const insets = useSafeAreaInsets();
  const { addItem, cartItems } = useCart();

  const products = DUMMY_PRODUCTS[shop.id] ?? [];
  const [activeTab, setActiveTab] = useState('products');
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerBg = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: ['rgba(9,9,11,0)', 'rgba(9,9,11,0.97)'],
    extrapolate: 'clamp',
  });

  const cartCount = cartItems.reduce((sum, i) => i.shopId === shop.id ? sum + i.quantity : sum, 0);

  const getQuantity = (productId) => {
    const found = cartItems.find(i => i.id === productId);
    return found ? found.quantity : 0;
  };

  const handleAdd = useCallback((product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addItem({ ...product, shopName: shop.name, shopColor: shop.color });
  }, [addItem, shop]);

  const handleWhatsApp = () => {
    const num = shop.whatsapp.replace(/\D/g, '');
    Linking.openURL(`whatsapp://send?phone=${num}`).catch(() =>
      Linking.openURL(`https://wa.me/${num}`)
    );
  };

  const handleCall = () => Linking.openURL(`tel:${shop.phone}`);

  const tabs = [
    { id: 'products', label: `Products (${products.length})` },
    { id: 'info', label: 'Info' },
  ];

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>

      {/* Sticky top bar */}
      <Animated.View style={[styles.topBar, { backgroundColor: headerBg, paddingTop: insets.top + 6 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={16} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{shop.name}</Text>
        <TouchableOpacity
          style={[styles.cartBtn, { borderColor: shop.color + '40' }]}
          onPress={() => navigation.navigate('Cart')}
        >
          <Icon name="shopping-cart" size={14} color={shop.color} />
          {cartCount > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: shop.color }]}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero section */}
        <View style={[styles.hero, { paddingTop: insets.top + 60 }]}>
          <View style={[styles.heroIcon, { backgroundColor: shop.color + '1a', borderColor: shop.color + '30' }]}>
            <Icon name={shop.icon} size={36} color={shop.color} />
          </View>
          <View style={styles.heroInfo}>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroName}>{shop.name}</Text>
              {shop.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Icon name="check-circle" size={12} color="#22C55E" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            <Text style={styles.heroDesc}>{shop.description}</Text>

            {/* Meta row */}
            <View style={styles.metaRow}>
              <View style={[styles.metaChip, { borderColor: (shop.isOpen ? '#22C55E' : 'rgba(255,255,255,0.15)') + '50' }]}>
                <View style={[styles.metaDot, { backgroundColor: shop.isOpen ? '#22C55E' : 'rgba(255,255,255,0.2)' }]} />
                <Text style={[styles.metaText, { color: shop.isOpen ? '#22C55E' : 'rgba(255,255,255,0.4)' }]}>
                  {shop.isOpen ? 'Open Now' : 'Closed'}
                </Text>
              </View>
              <View style={styles.metaChip}>
                <Icon name="map-marker" size={10} color="rgba(255,255,255,0.3)" />
                <Text style={styles.metaText}>{shop.distance} away</Text>
              </View>
              <View style={styles.metaChip}>
                <Icon name="star" size={10} color="#EAB308" />
                <Text style={styles.metaText}>{shop.rating} ({shop.totalRatings})</Text>
              </View>
            </View>

            {/* Delivery info */}
            <View style={styles.deliveryRow}>
              <View style={[styles.deliveryChip, { backgroundColor: shop.color + '12' }]}>
                <Icon name="truck" size={10} color={shop.color} />
                <Text style={[styles.deliveryText, { color: shop.color }]}>
                  Delivery: KES {shop.deliveryFee}
                </Text>
              </View>
              <View style={[styles.deliveryChip, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                <Icon name="shopping-basket" size={10} color="rgba(255,255,255,0.5)" />
                <Text style={styles.deliveryTextMuted}>
                  Min order: KES {shop.minOrder}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#25D366' + '18', borderColor: '#25D366' + '35' }]}
            onPress={handleWhatsApp}
            activeOpacity={0.8}
          >
            <Icon name="whatsapp" size={16} color="#25D366" />
            <Text style={[styles.actionText, { color: '#25D366' }]}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.primarySurface, borderColor: theme.colors.primaryBorder }]}
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <Icon name="phone" size={15} color={theme.colors.primary} />
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }]}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <Icon name="map-o" size={15} color="rgba(255,255,255,0.5)" />
            <Text style={[styles.actionText, { color: 'rgba(255,255,255,0.5)' }]}>Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
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

        {/* Tab content */}
        {activeTab === 'products' ? (
          <View style={styles.productGrid}>
            {products.map((item, index) => (
              <View key={item.id} style={styles.productCol}>
                <ProductCard
                  item={item}
                  shopColor={shop.color}
                  onAdd={handleAdd}
                  quantity={getQuantity(item.id)}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.infoSection}>
            {[
              { icon: 'clock-o', label: 'Hours', value: shop.hours },
              { icon: 'map-marker', label: 'Address', value: shop.address },
              { icon: 'truck', label: 'Delivery Radius', value: `${shop.deliveryRadiusKm}km from shop` },
              { icon: 'phone', label: 'Phone', value: shop.phone },
            ].map(row => (
              <View key={row.label} style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Icon name={row.icon} size={13} color={shop.color} />
                </View>
                <View>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <Text style={styles.infoValue}>{row.value}</Text>
                </View>
              </View>
            ))}

            {/* Tags */}
            <View style={styles.tagsWrap}>
              {shop.tags.map(tag => (
                <View key={tag} style={[styles.tag, { backgroundColor: shop.color + '18', borderColor: shop.color + '30' }]}>
                  <Text style={[styles.tagText, { color: shop.color }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Animated.ScrollView>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <View style={[styles.cartBar, { bottom: insets.bottom + 16 }]}>
          <View style={styles.cartBarLeft}>
            <View style={[styles.cartBarBadge, { backgroundColor: shop.color }]}>
              <Text style={styles.cartBarBadgeText}>{cartCount}</Text>
            </View>
            <Text style={styles.cartBarText}>items in cart</Text>
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
  root: { flex: 1, backgroundColor: '#0a0a0a' },

  // Top bar
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingBottom: 12, gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: 'rgba(9,9,11,0.8)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  cartBtn: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: 'rgba(9,9,11,0.8)', borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },

  // Hero
  hero: { paddingHorizontal: 16, paddingBottom: 20, gap: 16 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, alignSelf: 'flex-start',
  },
  heroInfo: { gap: 8 },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  heroName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: 11, color: '#22C55E', fontWeight: '600' },
  heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 19 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  metaDot: { width: 6, height: 6, borderRadius: 3 },
  metaText: { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },
  deliveryRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  deliveryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  deliveryText: { fontSize: 11, fontWeight: '600' },
  deliveryTextMuted: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },

  // Actions
  actions: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingBottom: 20,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    paddingVertical: 11, borderRadius: 12, borderWidth: 1,
  },
  actionText: { fontSize: 12, fontWeight: '600' },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 4,
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },

  // Products
  productGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, paddingTop: 12, gap: 12,
  },
  productCol: { width: PRODUCT_WIDTH },
  productCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 12, gap: 6,
  },
  productIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  productName: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.88)', lineHeight: 16 },
  productCat: { fontSize: 10, fontWeight: '500' },
  productBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  productPrice: { fontSize: 13, fontWeight: '700', color: '#fff' },
  addBtn: {
    width: 26, height: 26, borderRadius: 8,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  qtyBadge: {
    width: 26, height: 26, borderRadius: 8,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  qtyText: { fontSize: 11, fontWeight: '800' },
  outOfStock: { fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: '600' },

  // Info tab
  infoSection: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },
  infoRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingBottom: 14, borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  infoIconWrap: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: '500', marginBottom: 2 },
  infoValue: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 4 },
  tag: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1,
  },
  tagText: { fontSize: 11, fontWeight: '600' },

  // Cart bar
  cartBar: {
    position: 'absolute', left: 16, right: 16,
    backgroundColor: 'rgba(14,14,16,0.97)',
    borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 14, paddingRight: 6, paddingVertical: 8,
  },
  cartBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartBarBadge: {
    width: 24, height: 24, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  cartBarBadgeText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  cartBarText: { fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
  cartBarBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12,
  },
  cartBarBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});