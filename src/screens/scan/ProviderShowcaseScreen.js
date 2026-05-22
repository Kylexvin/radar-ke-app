// src/screens/scan/ProviderShowcaseScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  Alert,
} from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import theme from '../../utils/theme';

const { width } = Dimensions.get('window');
const CARD_W = (width - 16 * 2 - 12) / 2;

// Dummy items — replace with API call using provider.id
const DUMMY_ITEMS = [
  { id: '1', name: 'Phone Screen Repair', price: 'KSh 1,500', category: 'Repair', available: true, desc: 'All smartphone brands. Same day service.' },
  { id: '2', name: 'Battery Replacement', price: 'KSh 800', category: 'Repair', available: true, desc: 'Original batteries only.' },
  { id: '3', name: 'Laptop Servicing', price: 'KSh 2,000', category: 'Service', available: false, desc: 'Full hardware and software check.' },
  { id: '4', name: 'Data Recovery', price: 'KSh 3,500', category: 'Service', available: true, desc: 'Recover deleted files from any device.' },
  { id: '5', name: 'Charging Port Fix', price: 'KSh 600', category: 'Repair', available: true, desc: 'Fast 30-minute fix.' },
  { id: '6', name: 'Software Unlocking', price: 'KSh 500', category: 'Service', available: true, desc: 'Any network, any device.' },
];

const CATEGORIES = ['All', ...new Set(DUMMY_ITEMS.map(i => i.category))];

export default function ProviderShowcaseScreen({ route, navigation }) {
  const { provider } = route.params;
  const insets = useSafeAreaInsets();

  const hasShop = provider.capabilities?.hasShop ?? false;

  const [activeCategory, setActiveCategory] = useState('All');
  const [cartItems, setCartItems] = useState([]); // for shop mode

  const filtered = activeCategory === 'All'
    ? DUMMY_ITEMS
    : DUMMY_ITEMS.filter(i => i.category === activeCategory);

  const availableFiltered = filtered.filter(i => i.available);
  const unavailableFiltered = filtered.filter(i => !i.available);

  const handleInquire = (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const num = (provider.whatsapp || provider.phone || '').replace(/\D/g, '');
    if (!num) {
      Alert.alert('Contact', 'This provider has no contact info yet.');
      return;
    }
    const msg = `Hi, I'm interested in: *${item.name}* (${item.price}). Is it available?`;
    Linking.openURL(`whatsapp://send?phone=${num}&text=${encodeURIComponent(msg)}`).catch(() =>
      Linking.openURL(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`)
    );
  };

  const handleAddToCart = (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCartItems(prev => {
      const exists = prev.find(c => c.id === item.id);
      if (exists) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cartItems.reduce((sum, i) => {
    const price = parseInt(i.price.replace(/\D/g, ''), 10) || 0;
    return sum + price * i.qty;
  }, 0);

  const ItemCard = ({ item }) => (
    <View style={[styles.itemCard, !item.available && styles.itemCardDimmed]}>
      <View style={styles.itemImg}>
        <Icon name="image" size={24} color="rgba(255,255,255,0.1)" />
        {!item.available && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        )}
      </View>
      <View style={styles.itemBody}>
        <View style={styles.itemCatBadge}>
          <Text style={styles.itemCatText}>{item.category}</Text>
        </View>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        {item.desc ? <Text style={styles.itemDesc} numberOfLines={2}>{item.desc}</Text> : null}
        <Text style={styles.itemPrice}>{item.price}</Text>
      </View>
      {item.available && (
        <View style={styles.itemActions}>
          {hasShop ? (
            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={() => handleAddToCart(item)}
              activeOpacity={0.8}
            >
              <Icon name="shopping-cart" size={12} color="#fff" />
              <Text style={styles.addToCartText}>Add</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.inquireBtn}
              onPress={() => handleInquire(item)}
              activeOpacity={0.8}
            >
              <Icon name="whatsapp" size={12} color="#25D366" />
              <Text style={styles.inquireBtnText}>Inquire</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
          <Icon name="chevron-left" size={16} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {hasShop ? 'Menu & Products' : 'Showcase'}
          </Text>
          <Text style={styles.headerSub} numberOfLines={1}>{provider.name}</Text>
        </View>
        {/* Cart badge — only for shop mode */}
        {hasShop && cartCount > 0 && (
          <TouchableOpacity style={styles.cartBtn} activeOpacity={0.8}>
            <Icon name="shopping-cart" size={16} color={theme.colors.primary} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          </TouchableOpacity>
        )}
        {(!hasShop || cartCount === 0) && <View style={{ width: 36 }} />}
      </View>

      {/* Provider mini info */}
      <View style={styles.providerBar}>
        <View style={[styles.providerIcon, { backgroundColor: theme.colors.primary + '18' }]}>
          <Icon name={provider.icon ?? 'user'} size={14} color={theme.colors.primary} />
        </View>
        <View style={styles.providerBarInfo}>
          <Text style={styles.providerBarName}>{provider.name}</Text>
          <Text style={styles.providerBarMeta}>{provider.distance} away · {provider.isActive ? 'Available' : 'Unavailable'}</Text>
        </View>
        <TouchableOpacity
          style={styles.providerBarContact}
          onPress={() => {
            const num = (provider.whatsapp || provider.phone || '').replace(/\D/g, '');
            if (num) Linking.openURL(`whatsapp://send?phone=${num}`).catch(() => Linking.openURL(`https://wa.me/${num}`));
          }}
          activeOpacity={0.8}
        >
          <Icon name="whatsapp" size={14} color="#25D366" />
          <Text style={styles.providerBarContactText}>Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catFilterRow}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
            onPress={() => setActiveCategory(cat)}
            activeOpacity={0.75}
          >
            <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + (hasShop && cartCount > 0 ? 110 : 24) }]}
      >
        {/* Available items */}
        {availableFiltered.length > 0 && (
          <View style={styles.itemsGrid}>
            {availableFiltered.map(item => <ItemCard key={item.id} item={item} />)}
          </View>
        )}

        {/* Unavailable items */}
        {unavailableFiltered.length > 0 && (
          <View style={styles.unavailableSection}>
            <Text style={styles.unavailableSectionTitle}>Currently Unavailable</Text>
            <View style={styles.itemsGrid}>
              {unavailableFiltered.map(item => <ItemCard key={item.id} item={item} />)}
            </View>
          </View>
        )}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="inbox" size={32} color={theme.colors.textDim} />
            <Text style={styles.emptyText}>No items in this category</Text>
          </View>
        )}

        {/* Info note */}
        <View style={styles.infoNote}>
          <Icon name="info-circle" size={12} color={theme.colors.textDim} />
          <Text style={styles.infoNoteText}>
            {hasShop
              ? 'Add items to cart and the provider will confirm your order via WhatsApp. M-Pesa checkout coming soon.'
              : 'Tap Inquire to contact the provider directly via WhatsApp about any item.'}
          </Text>
        </View>
      </ScrollView>

      {/* Cart bar — only for shop mode with items */}
      {hasShop && cartCount > 0 && (
        <View style={[styles.cartBar, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.cartBarLeft}>
            <Text style={styles.cartBarCount}>{cartCount} item{cartCount > 1 ? 's' : ''}</Text>
            <Text style={styles.cartBarTotal}>KSh {cartTotal.toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={styles.cartBarBtn} activeOpacity={0.85}>
            <Icon name="shopping-cart" size={15} color="#fff" />
            <Text style={styles.cartBarBtnText}>View Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  headerTitle: { fontSize: theme.fontSizes.md, fontWeight: '800', color: theme.colors.text },
  headerSub: { fontSize: theme.fontSizes.xs, color: theme.colors.textDim },
  cartBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: theme.colors.primarySurface,
    borderWidth: 1, borderColor: theme.colors.primaryBorder,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },

  providerBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  providerIcon: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  providerBarInfo: { flex: 1 },
  providerBarName: { fontSize: theme.fontSizes.sm, fontWeight: '700', color: theme.colors.text },
  providerBarMeta: { fontSize: theme.fontSizes.xs, color: theme.colors.textDim },
  providerBarContact: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(37,211,102,0.1)',
    borderWidth: 1, borderColor: 'rgba(37,211,102,0.25)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
  },
  providerBarContactText: { fontSize: theme.fontSizes.sm, fontWeight: '700', color: '#25D366' },

  catFilterRow: {
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  catChipActive: { backgroundColor: theme.colors.primarySurface, borderColor: theme.colors.primaryBorder },
  catChipText: { fontSize: theme.fontSizes.sm, fontWeight: '600', color: theme.colors.textMuted },
  catChipTextActive: { color: theme.colors.primary },

  scroll: { padding: 16, gap: 16 },
  itemsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  itemCard: {
    width: CARD_W,
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: 16, overflow: 'hidden',
  },
  itemCardDimmed: { opacity: 0.55 },
  itemImg: {
    height: CARD_W * 0.6,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  unavailableOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 4, alignItems: 'center',
  },
  unavailableText: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  itemBody: { padding: 10, gap: 4, flex: 1 },
  itemCatBadge: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6, alignSelf: 'flex-start',
  },
  itemCatText: { fontSize: 9, fontWeight: '600', color: theme.colors.textDim, textTransform: 'uppercase' },
  itemName: { fontSize: theme.fontSizes.sm, fontWeight: '700', color: theme.colors.text, lineHeight: 17 },
  itemDesc: { fontSize: 11, color: theme.colors.textDim, lineHeight: 15 },
  itemPrice: { fontSize: theme.fontSizes.sm, fontWeight: '800', color: theme.colors.primary, marginTop: 2 },
  itemActions: { paddingHorizontal: 10, paddingBottom: 10 },
  inquireBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    backgroundColor: 'rgba(37,211,102,0.08)',
    borderWidth: 1, borderColor: 'rgba(37,211,102,0.25)',
    paddingVertical: 7, borderRadius: 10,
  },
  inquireBtnText: { fontSize: 11, fontWeight: '700', color: '#25D366' },
  addToCartBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    backgroundColor: theme.colors.primary,
    paddingVertical: 7, borderRadius: 10,
  },
  addToCartText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  unavailableSection: { gap: 10 },
  unavailableSectionTitle: {
    fontSize: theme.fontSizes.sm, fontWeight: '700',
    color: theme.colors.textDim, textTransform: 'uppercase', letterSpacing: 0.5,
  },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: theme.fontSizes.md, color: theme.colors.textMuted },

  infoNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: 12, padding: 12, marginTop: 4,
  },
  infoNoteText: { flex: 1, fontSize: 11, color: theme.colors.textDim, lineHeight: 16 },

  cartBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: 'rgba(10,10,10,0.97)',
    borderTopWidth: 1, borderTopColor: theme.colors.border,
  },
  cartBarLeft: { gap: 2 },
  cartBarCount: { fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, fontWeight: '600' },
  cartBarTotal: { fontSize: theme.fontSizes.lg, fontWeight: '800', color: theme.colors.text },
  cartBarBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
  },
  cartBarBtnText: { fontSize: theme.fontSizes.md, fontWeight: '800', color: '#fff' },
});
