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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome as Icon } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import theme from '../../utils/theme';

const { colors } = theme;
const { width } = Dimensions.get('window');
const PRODUCT_WIDTH = (width - 48 - 12) / 2;

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

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
const ProductCard = ({ item, providerColor, hasShop, onAdd, onRemove, quantity, onInquire }) => (
  <View style={[styles.productCard, !item.isAvailable && styles.productCardDim]}>
    <View style={[styles.productImgBox, { backgroundColor: providerColor + '12' }]}>
      <Icon name="image" size={22} color={providerColor + '55'} />
      {!item.isAvailable && (
        <View style={styles.outOfStockOverlay}>
          <Text style={styles.outOfStockOverlayText}>Unavailable</Text>
        </View>
      )}
    </View>
    {item.category ? (
      <View style={styles.itemCatBadge}>
        <Text style={styles.itemCatText}>{item.category}</Text>
      </View>
    ) : null}
    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
    {item.description ? (
      <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
    ) : null}
    <View style={styles.productBottom}>
      <View>
        <Text style={[styles.productPrice, { color: providerColor }]}>KSh {item.price}</Text>
        {item.priceLabel ? (
          <Text style={styles.productUnit}>{item.priceLabel}</Text>
        ) : null}
      </View>
      {item.isAvailable && (
        hasShop ? (
          quantity > 0 ? (
            <View style={[styles.qtyRow, { borderColor: providerColor + '40' }]}>
              <TouchableOpacity onPress={() => onRemove(item)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <Icon name="minus" size={9} color={providerColor} />
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: providerColor }]}>{quantity}</Text>
              <TouchableOpacity onPress={() => onAdd(item)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <Icon name="plus" size={9} color={providerColor} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: providerColor + '18', borderColor: providerColor + '35' }]}
              onPress={() => onAdd(item)}
              activeOpacity={0.75}
            >
              <Icon name="plus" size={11} color={providerColor} />
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity
            style={styles.inquireBtn}
            onPress={() => onInquire(item)}
            activeOpacity={0.75}
          >
            <Icon name="whatsapp" size={11} color="#25D366" />
            <Text style={styles.inquireBtnText}>Ask</Text>
          </TouchableOpacity>
        )
      )}
    </View>
  </View>
);

// ─── SCREEN ───────────────────────────────────────────────────────────────────
export default function ShopScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();

  // Accept provider from both Scan and Marketplace entry points
  const provider = route?.params?.provider;

  if (!provider) {
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

  const providerColor = provider.color || colors.primary;
  const hasShop = provider.capabilities?.hasShop ?? false;
  const items = provider.showcaseItems || [];

  const [activeTab, setActiveTab] = useState('products');
  const [cart, setCart] = useState({});
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerBg = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: ['rgba(12,12,12,0)', 'rgba(12,12,12,0.98)'],
    extrapolate: 'clamp',
  });

  const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = items.find(i => i._id === id);
    return sum + (item?.price || 0) * qty;
  }, 0);

  const getQuantity = (id) => cart[id] ?? 0;

  const handleAdd = useCallback((item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart(prev => ({ ...prev, [item._id]: (prev[item._id] ?? 0) + 1 }));
  }, []);

  const handleRemove = useCallback((item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart(prev => {
      const current = prev[item._id] ?? 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[item._id];
        return next;
      }
      return { ...prev, [item._id]: current - 1 };
    });
  }, []);

  const handleInquire = useCallback((item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const num = (provider.whatsapp || provider.phone || '').replace(/\D/g, '');
    if (!num) {
      Alert.alert('No contact', 'This provider has no contact number.');
      return;
    }
    const msg = `Hi, I'm interested in: *${item.name}* (KSh ${item.price}). Is it available?`;
    Linking.openURL(`whatsapp://send?phone=${num}&text=${encodeURIComponent(msg)}`).catch(() =>
      Linking.openURL(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`)
    );
  }, [provider]);

  const handleWhatsApp = () => {
    const num = (provider.whatsapp || provider.phone || '').replace(/\D/g, '');
    if (num) Linking.openURL(`whatsapp://send?phone=${num}`).catch(() => Linking.openURL(`https://wa.me/${num}`));
  };

  const handleCall = () => {
    if (!provider.phone) return;
    Alert.alert(`Call ${provider.name}`, provider.phone, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => Linking.openURL(`tel:${provider.phone}`) },
    ]);
  };

  const handleDirections = () => {
    if (!provider.coordinates) return;
    const { latitude, longitude } = provider.coordinates;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
  };

  const availableItems = items.filter(i => i.isAvailable);
  const unavailableItems = items.filter(i => !i.isAvailable);

  const tabs = [
    { id: 'products', label: `${hasShop ? 'Products' : 'Showcase'} (${items.length})` },
    { id: 'info', label: 'Info' },
  ];

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>

      {/* Sticky top bar */}
      <Animated.View style={[styles.topBar, { backgroundColor: headerBg, paddingTop: insets.top + 6 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={16} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{provider.name}</Text>
        {hasShop ? (
          <TouchableOpacity
            style={[styles.topCartBtn, { borderColor: providerColor + '40' }]}
            onPress={() => navigation.navigate('Cart', { cart, provider })}
          >
            <Icon name="shopping-cart" size={14} color={providerColor} />
            {cartCount > 0 && (
              <View style={[styles.topCartBadge, { backgroundColor: providerColor }]}>
                <Text style={styles.topCartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
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
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: insets.top + 60 }]}>
          <View style={[styles.heroIcon, { backgroundColor: providerColor + '18', borderColor: providerColor + '30' }]}>
            <Icon name={getCategoryIcon(provider.category)} size={28} color={providerColor} />
          </View>
          <View style={styles.heroBody}>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroName}>{provider.name}</Text>
              {provider.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Icon name="check-circle" size={11} color={colors.success} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            {provider.description ? (
              <Text style={styles.heroDesc} numberOfLines={2}>{provider.description}</Text>
            ) : null}
            <View style={styles.metaRow}>
              <View style={[styles.metaChip, { borderColor: provider.isActive ? 'rgba(34,197,94,0.3)' : colors.border }]}>
                <View style={[styles.metaDot, { backgroundColor: provider.isActive ? colors.success : colors.textFaint }]} />
                <Text style={[styles.metaChipText, { color: provider.isActive ? colors.success : colors.textDim }]}>
                  {provider.isActive ? 'Open' : 'Closed'}
                </Text>
              </View>
              {provider.distance ? (
                <View style={styles.metaChip}>
                  <Icon name="map-marker" size={9} color={colors.textDim} />
                  <Text style={styles.metaChipText}>{provider.distance} away</Text>
                </View>
              ) : null}
              {provider.rating ? (
                <View style={styles.metaChip}>
                  <Icon name="star" size={9} color="#FBBF24" />
                  <Text style={styles.metaChipText}>{provider.rating}</Text>
                </View>
              ) : null}
              <View style={[styles.metaChip, { backgroundColor: hasShop ? colors.primarySurface : 'rgba(59,130,246,0.1)', borderColor: hasShop ? colors.primaryBorder : 'rgba(59,130,246,0.25)' }]}>
                <Icon name={hasShop ? 'shopping-cart' : 'th-large'} size={9} color={hasShop ? colors.primary : '#3B82F6'} />
                <Text style={[styles.metaChipText, { color: hasShop ? colors.primary : '#3B82F6' }]}>
                  {hasShop ? 'Shop' : 'Showcase'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#25D36612', borderColor: '#25D36630' }]}
            onPress={handleWhatsApp} activeOpacity={0.8}
          >
            <Icon name="whatsapp" size={14} color="#25D366" />
            <Text style={[styles.actionBtnText, { color: '#25D366' }]}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primarySurface, borderColor: colors.primaryBorder }]}
            onPress={handleCall} activeOpacity={0.8}
          >
            <Icon name="phone" size={13} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleDirections} activeOpacity={0.8}
          >
            <Icon name="location-arrow" size={13} color={colors.textDim} />
            <Text style={[styles.actionBtnText, { color: colors.textDim }]}>Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && { borderBottomColor: providerColor, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && { color: providerColor }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Products tab */}
        {activeTab === 'products' ? (
          items.length > 0 ? (
            <View>
              {/* Available */}
              <View style={styles.productGrid}>
                {availableItems.map(item => (
                  <View key={item._id} style={styles.productCol}>
                    <ProductCard
                      item={item}
                      providerColor={providerColor}
                      hasShop={hasShop}
                      onAdd={handleAdd}
                      onRemove={handleRemove}
                      onInquire={handleInquire}
                      quantity={getQuantity(item._id)}
                    />
                  </View>
                ))}
              </View>
              {/* Unavailable */}
              {unavailableItems.length > 0 && (
                <View style={styles.unavailableSection}>
                  <Text style={styles.unavailableSectionTitle}>Unavailable</Text>
                  <View style={styles.productGrid}>
                    {unavailableItems.map(item => (
                      <View key={item._id} style={styles.productCol}>
                        <ProductCard
                          item={item}
                          providerColor={providerColor}
                          hasShop={hasShop}
                          onAdd={handleAdd}
                          onRemove={handleRemove}
                          onInquire={handleInquire}
                          quantity={0}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {/* Info note */}
              <View style={styles.infoNote}>
                <Icon name="info-circle" size={12} color={colors.textDim} />
                <Text style={styles.infoNoteText}>
                  {hasShop
                    ? 'Add items to cart. Provider confirms via WhatsApp. M-Pesa checkout coming soon.'
                    : 'Tap Ask to contact the provider via WhatsApp about any item.'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyProducts}>
              <Icon name="cube" size={32} color={colors.textFaint} />
              <Text style={styles.emptyProductsText}>No items listed yet</Text>
            </View>
          )
        ) : (
          /* Info tab */
          <View style={styles.infoSection}>
            {[
              provider.address && { icon: 'map-marker', label: 'Address', value: provider.address },
              provider.radiusKm && { icon: 'arrows-alt', label: 'Service Radius', value: `${provider.radiusKm}km` },
              provider.phone && { icon: 'phone', label: 'Phone', value: provider.phone },
              provider.whatsapp && { icon: 'whatsapp', label: 'WhatsApp', value: provider.whatsapp },
            ].filter(Boolean).map(row => (
              <View key={row.label} style={styles.infoRow}>
                <View style={[styles.infoIconWrap, { backgroundColor: providerColor + '12' }]}>
                  <Icon name={row.icon} size={13} color={providerColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <Text style={styles.infoValue}>{row.value}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Animated.ScrollView>

      {/* Floating cart bar — shop mode only */}
      {hasShop && cartCount > 0 && (
        <View style={[styles.cartBar, { bottom: insets.bottom + 16 }]}>
          <View style={styles.cartBarLeft}>
            <View style={[styles.cartBarBadge, { backgroundColor: providerColor }]}>
              <Text style={styles.cartBarBadgeText}>{cartCount}</Text>
            </View>
            <View>
              <Text style={styles.cartBarLabel}>{cartCount} item{cartCount > 1 ? 's' : ''}</Text>
              <Text style={styles.cartBarTotal}>KSh {cartTotal.toLocaleString()}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.cartBarBtn, { backgroundColor: providerColor }]}
            onPress={() => navigation.navigate('Cart', { cart, provider })}
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
  root: { flex: 1, backgroundColor: colors.background },
  errorScreen: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 16, color: colors.textMuted, fontWeight: '600' },
  errorBtn: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primarySurface, borderRadius: 12, borderWidth: 1, borderColor: colors.primaryBorder },
  errorBtnText: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingBottom: 12, gap: 12,
  },
  backBtn: { width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(12,12,12,0.85)', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  topCartBtn: { width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(12,12,12,0.85)', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  topCartBadge: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  topCartBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },

  hero: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
  heroIcon: { width: 68, height: 68, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  heroBody: { gap: 8 },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  heroName: { fontSize: 22, fontWeight: '800', color: colors.text },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: 11, color: colors.success, fontWeight: '600' },
  heroDesc: { fontSize: 13, color: colors.textDim, lineHeight: 19 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  metaDot: { width: 5, height: 5, borderRadius: 3 },
  metaChipText: { fontSize: 10, color: colors.textDim, fontWeight: '500' },

  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 20 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
  actionBtnText: { fontSize: 12, fontWeight: '600' },

  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 4 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textDim },

  productGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  productCol: { width: PRODUCT_WIDTH },
  productCard: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  productCardDim: { opacity: 0.45 },
  productImgBox: { height: PRODUCT_WIDTH * 0.55, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  outOfStockOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 3, alignItems: 'center' },
  outOfStockOverlayText: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  itemCatBadge: { backgroundColor: colors.surfaceLight, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, alignSelf: 'flex-start', marginHorizontal: 10, marginTop: 8 },
  itemCatText: { fontSize: 9, fontWeight: '600', color: colors.textDim, textTransform: 'uppercase' },
  productName: { fontSize: 12, fontWeight: '700', color: colors.text, lineHeight: 16, paddingHorizontal: 10, paddingTop: 4 },
  productDesc: { fontSize: 10, color: colors.textDim, lineHeight: 14, paddingHorizontal: 10 },
  productBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 10 },
  productPrice: { fontSize: 13, fontWeight: '800' },
  productUnit: { fontSize: 9, color: colors.textDim, marginTop: 1 },
  addBtn: { width: 28, height: 28, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  qtyText: { fontSize: 12, fontWeight: '800', minWidth: 14, textAlign: 'center' },
  inquireBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(37,211,102,0.1)', borderWidth: 1, borderColor: 'rgba(37,211,102,0.25)', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  inquireBtnText: { fontSize: 10, fontWeight: '700', color: '#25D366' },

  unavailableSection: { paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  unavailableSectionTitle: { fontSize: 11, fontWeight: '700', color: colors.textDim, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, margin: 16, padding: 12 },
  infoNoteText: { flex: 1, fontSize: 11, color: colors.textDim, lineHeight: 16 },
  emptyProducts: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyProductsText: { fontSize: 14, color: colors.textDim },

  infoSection: { paddingHorizontal: 16, paddingTop: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoIconWrap: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 10, color: colors.textFaint, fontWeight: '500', marginBottom: 2 },
  infoValue: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },

  cartBar: { position: 'absolute', left: 16, right: 16, backgroundColor: 'rgba(14,14,16,0.97)', borderRadius: 16, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 14, paddingRight: 6, paddingVertical: 10 },
  cartBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartBarBadge: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  cartBarBadgeText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  cartBarLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  cartBarTotal: { fontSize: 14, fontWeight: '800', color: colors.text },
  cartBarBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  cartBarBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});