// src/screens/marketplace/CartScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome as Icon } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import theme from '../../utils/theme';

const { colors } = theme;

export default function CartScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();

  const provider = route?.params?.provider;
  const initialCart = route?.params?.cart || {};

  const [cart, setCart] = useState(initialCart);

  if (!provider) {
    return (
      <View style={styles.errorScreen}>
        <Icon name="shopping-cart" size={36} color={colors.textFaint} />
        <Text style={styles.errorText}>Your cart is empty</Text>
        <TouchableOpacity style={styles.errorBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.errorBtnText}>Browse Shops</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const providerColor = provider.color || colors.primary;
  const items = provider.showcaseItems || [];

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => {
      const item = items.find(i => i._id === id);
      return item ? { ...item, qty } : null;
    })
    .filter(Boolean);

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

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

  const handleWhatsAppOrder = () => {
    const num = (provider.whatsapp || provider.phone || '').replace(/\D/g, '');
    if (!num) {
      Alert.alert('No contact', 'This provider has no contact number.');
      return;
    }
    const orderLines = cartItems.map(i => `• ${i.name} x${i.qty} — KSh ${i.price * i.qty}`).join('\n');
    const msg = `Hi ${provider.name}, I'd like to place an order:\n\n${orderLines}\n\nTotal: KSh ${subtotal.toLocaleString()}\n\nPlease confirm availability.`;
    Linking.openURL(`whatsapp://send?phone=${num}&text=${encodeURIComponent(msg)}`).catch(() =>
      Linking.openURL(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`)
    );
  };

  const handleMpesa = () => {
    Alert.alert('Coming Soon', 'M-Pesa checkout will be available soon. Use WhatsApp to place your order for now.');
  };

  if (cartItems.length === 0) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="chevron-left" size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.emptyState}>
          <Icon name="shopping-cart" size={40} color={colors.textFaint} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add items from the shop to continue</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.emptyBtnText}>Back to Shop</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={16} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={[styles.countBadge, { backgroundColor: providerColor + '20', borderColor: providerColor + '40' }]}>
          <Text style={[styles.countBadgeText, { color: providerColor }]}>{cartCount}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 140 }]}
      >
        {/* Provider info */}
        <View style={[styles.providerBar, { borderColor: providerColor + '25' }]}>
          <View style={[styles.providerIcon, { backgroundColor: providerColor + '18' }]}>
            <Icon name="store" size={14} color={providerColor} />
          </View>
          <View style={styles.providerBarInfo}>
            <Text style={styles.providerBarName}>{provider.name}</Text>
            <Text style={styles.providerBarSub}>{provider.address || provider.locationAddress || 'Nairobi'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.addMoreBtn, { borderColor: providerColor + '40' }]}
          >
            <Icon name="plus" size={11} color={providerColor} />
            <Text style={[styles.addMoreText, { color: providerColor }]}>Add more</Text>
          </TouchableOpacity>
        </View>

        {/* Cart items */}
        <View style={styles.itemsList}>
          {cartItems.map((item, i) => (
            <View key={item._id} style={[styles.cartItem, i === cartItems.length - 1 && styles.cartItemLast]}>
              <View style={[styles.cartItemImg, { backgroundColor: providerColor + '10' }]}>
                <Icon name="image" size={16} color={providerColor + '55'} />
              </View>
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
                {item.category ? <Text style={styles.cartItemCat}>{item.category}</Text> : null}
                <Text style={[styles.cartItemPrice, { color: providerColor }]}>KSh {item.price}</Text>
              </View>
              <View style={styles.cartItemQty}>
                <TouchableOpacity
                  style={[styles.qtyBtn, { borderColor: providerColor + '40' }]}
                  onPress={() => handleRemove(item)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Icon name="minus" size={9} color={providerColor} />
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: providerColor }]}>{item.qty}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, { borderColor: providerColor + '40' }]}
                  onPress={() => handleAdd(item)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Icon name="plus" size={9} color={providerColor} />
                </TouchableOpacity>
                <Text style={styles.cartItemLineTotal}>KSh {(item.price * item.qty).toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Order summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({cartCount} items)</Text>
            <Text style={styles.summaryValue}>KSh {subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>To be confirmed</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>Estimated Total</Text>
            <Text style={[styles.summaryTotalValue, { color: providerColor }]}>
              KSh {subtotal.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <Icon name="info-circle" size={13} color={colors.textDim} />
          <Text style={styles.noteText}>
            Order via WhatsApp — provider will confirm and arrange delivery. M-Pesa checkout coming soon.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTAs */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.whatsappBtn, { borderColor: '#25D36640' }]}
          onPress={handleWhatsAppOrder}
          activeOpacity={0.85}
        >
          <Icon name="whatsapp" size={16} color="#25D366" />
          <Text style={[styles.whatsappBtnText, { color: '#25D366' }]}>Order via WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mpesaBtn, { backgroundColor: providerColor }]}
          onPress={handleMpesa}
          activeOpacity={0.85}
        >
          <Icon name="mobile" size={16} color="#fff" />
          <Text style={styles.mpesaBtnText}>Pay with M-Pesa</Text>
          <View style={styles.soonBadge}>
            <Text style={styles.soonText}>Soon</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  errorScreen: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 15, color: colors.textMuted, fontWeight: '600' },
  errorBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primarySurface, borderRadius: 12, borderWidth: 1, borderColor: colors.primaryBorder },
  errorBtnText: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: theme.fontSizes.lg, fontWeight: '800', color: colors.text },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  countBadgeText: { fontSize: 12, fontWeight: '800' },

  scroll: { padding: 16, gap: 14 },

  providerBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderRadius: 14, padding: 12 },
  providerIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  providerBarInfo: { flex: 1 },
  providerBarName: { fontSize: theme.fontSizes.sm, fontWeight: '700', color: colors.text },
  providerBarSub: { fontSize: theme.fontSizes.xs, color: colors.textDim },
  addMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  addMoreText: { fontSize: 11, fontWeight: '600' },

  itemsList: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  cartItemLast: { borderBottomWidth: 0 },
  cartItemImg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cartItemInfo: { flex: 1, gap: 2 },
  cartItemName: { fontSize: theme.fontSizes.sm, fontWeight: '700', color: colors.text },
  cartItemCat: { fontSize: theme.fontSizes.xs, color: colors.textDim },
  cartItemPrice: { fontSize: theme.fontSizes.sm, fontWeight: '700' },
  cartItemQty: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 26, height: 26, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 13, fontWeight: '800', minWidth: 16, textAlign: 'center' },
  cartItemLineTotal: { fontSize: 12, fontWeight: '700', color: colors.textMuted, minWidth: 64, textAlign: 'right' },

  summaryCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, gap: 10 },
  summaryTitle: { fontSize: theme.fontSizes.sm, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: theme.fontSizes.sm, color: colors.textMuted },
  summaryValue: { fontSize: theme.fontSizes.sm, fontWeight: '600', color: colors.text },
  summaryTotal: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 2 },
  summaryTotalLabel: { fontSize: theme.fontSizes.md, fontWeight: '700', color: colors.text },
  summaryTotalValue: { fontSize: theme.fontSizes.lg, fontWeight: '800' },

  noteCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 },
  noteText: { flex: 1, fontSize: 11, color: colors.textDim, lineHeight: 16 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textMuted },
  emptySub: { fontSize: 13, color: colors.textFaint },
  emptyBtn: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primarySurface, borderRadius: 12, borderWidth: 1, borderColor: colors.primaryBorder },
  emptyBtnText: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, gap: 10, paddingHorizontal: 16, paddingTop: 12, backgroundColor: 'rgba(10,10,10,0.97)', borderTopWidth: 1, borderTopColor: colors.border },
  whatsappBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 14, borderWidth: 1, backgroundColor: 'rgba(37,211,102,0.06)' },
  whatsappBtnText: { fontSize: 14, fontWeight: '700' },
  mpesaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, borderRadius: 14, opacity: 0.7 },
  mpesaBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  soonBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  soonText: { fontSize: 9, fontWeight: '700', color: '#fff' },
});