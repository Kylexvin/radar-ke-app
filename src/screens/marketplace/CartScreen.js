// src/screens/marketplace/CartScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome as Icon } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import theme from '../../utils/theme';
import { useCart } from './CartContext';

const DELIVERY_FEE = 80;

export default function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { cartItems, updateQuantity, removeItem, clearCart, total } = useCart();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [checkoutStep, setCheckoutStep] = useState('review'); // review | confirm | success

  const grandTotal = total + DELIVERY_FEE;

  // Group items by shop
  const byShop = cartItems.reduce((acc, item) => {
    if (!acc[item.shopId]) acc[item.shopId] = { shopName: item.shopName, shopColor: item.shopColor, items: [] };
    acc[item.shopId].items.push(item);
    return acc;
  }, {});

  const handleQuantityChange = (id, delta, current) => {
    Haptics.selectionAsync();
    updateQuantity(id, current + delta);
  };

  const handleRemove = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeItem(id);
  };

  const handleProceed = () => {
    if (!phone.trim()) {
      Alert.alert('Phone required', 'Enter your M-Pesa number to continue.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Address required', 'Enter your delivery address.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCheckoutStep('confirm');
  };

  const handleMpesaPay = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Real implementation: trigger Daraja STK push here
    setTimeout(() => {
      setCheckoutStep('success');
      clearCart();
    }, 1200);
  };

  if (checkoutStep === 'success') {
    return (
      <View style={[styles.root, styles.successWrap, { paddingTop: insets.top }]}>
        <View style={styles.successIcon}>
          <Icon name="check" size={36} color="#22C55E" />
        </View>
        <Text style={styles.successTitle}>Order Placed!</Text>
        <Text style={styles.successSub}>
          STK push sent to {phone}.{'\n'}Confirm payment on your phone.
        </Text>
        <TouchableOpacity
          style={[styles.successBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => { setCheckoutStep('review'); navigation.goBack(); }}
        >
          <Text style={styles.successBtnText}>Back to Marketplace</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (checkoutStep === 'confirm') {
    return (
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setCheckoutStep('review')}>
            <Icon name="chevron-left" size={16} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Confirm Order</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          {/* Order summary */}
          <View style={styles.confirmCard}>
            <Text style={styles.confirmSectionTitle}>Order Summary</Text>
            {cartItems.map(item => (
              <View key={item.id} style={styles.confirmRow}>
                <Text style={styles.confirmItemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.confirmItemMeta}>x{item.quantity}</Text>
                <Text style={styles.confirmItemPrice}>KES {item.price * item.quantity}</Text>
              </View>
            ))}
            <View style={styles.confirmDivider} />
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Delivery</Text>
              <Text style={styles.confirmValue}>KES {DELIVERY_FEE}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: '#fff', fontWeight: '700' }]}>Total</Text>
              <Text style={[styles.confirmValue, { color: theme.colors.primary, fontSize: 16, fontWeight: '800' }]}>
                KES {grandTotal}
              </Text>
            </View>
          </View>

          {/* Delivery details */}
          <View style={styles.confirmCard}>
            <Text style={styles.confirmSectionTitle}>Delivery Details</Text>
            <View style={styles.confirmRow}>
              <Icon name="map-marker" size={12} color="rgba(255,255,255,0.35)" />
              <Text style={styles.confirmValue}>{address}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Icon name="phone" size={12} color="rgba(255,255,255,0.35)" />
              <Text style={styles.confirmValue}>{phone}</Text>
            </View>
          </View>

          {/* M-Pesa notice */}
          <View style={[styles.mpesaNotice, { borderColor: '#22C55E33' }]}>
            <Icon name="mobile" size={22} color="#22C55E" />
            <View style={{ flex: 1 }}>
              <Text style={styles.mpesaTitle}>M-Pesa STK Push</Text>
              <Text style={styles.mpesaSub}>
                You'll receive a payment prompt on {phone}. Enter your PIN to complete.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.checkoutBar, { bottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[styles.payBtn, { backgroundColor: '#22C55E' }]}
            onPress={handleMpesaPay}
            activeOpacity={0.85}
          >
            <Icon name="mobile" size={18} color="#fff" />
            <Text style={styles.payBtnText}>Pay KES {grandTotal} via M-Pesa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Review step
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={16} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Your Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => { Alert.alert('Clear cart?', 'Remove all items?', [{ text: 'Cancel' }, { text: 'Clear', onPress: clearCart, style: 'destructive' }]); }}
          >
            <Icon name="trash-o" size={15} color="rgba(255,255,255,0.35)" />
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Icon name="shopping-cart" size={28} color="rgba(255,255,255,0.15)" />
          </View>
          <Text style={styles.emptyTitle}>Cart is empty</Text>
          <Text style={styles.emptySub}>Add products from a shop to get started</Text>
          <TouchableOpacity
            style={[styles.browseBtn, { borderColor: theme.colors.primaryBorder }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.browseBtnText, { color: theme.colors.primary }]}>Browse Shops</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 180 }}
          >
            {/* Items grouped by shop */}
            {Object.entries(byShop).map(([shopId, group]) => (
              <View key={shopId} style={styles.shopGroup}>
                <View style={styles.shopGroupHeader}>
                  <View style={[styles.shopGroupDot, { backgroundColor: group.shopColor }]} />
                  <Text style={styles.shopGroupName}>{group.shopName}</Text>
                </View>
                {group.items.map(item => (
                  <View key={item.id} style={styles.cartItem}>
                    <View style={[styles.cartItemIcon, { backgroundColor: group.shopColor + '18' }]}>
                      <Icon name="cube" size={16} color={group.shopColor} />
                    </View>
                    <View style={styles.cartItemBody}>
                      <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.cartItemPrice}>KES {item.price} each</Text>
                    </View>
                    <View style={styles.cartItemControls}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleQuantityChange(item.id, -1, item.quantity)}
                      >
                        <Icon name={item.quantity === 1 ? 'trash-o' : 'minus'} size={11}
                          color={item.quantity === 1 ? theme.colors.primary : 'rgba(255,255,255,0.5)'} />
                      </TouchableOpacity>
                      <Text style={styles.qtyNum}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleQuantityChange(item.id, 1, item.quantity)}
                      >
                        <Icon name="plus" size={11} color="#22C55E" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.cartItemTotal}>KES {item.price * item.quantity}</Text>
                  </View>
                ))}
              </View>
            ))}

            {/* Delivery details form */}
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>Delivery Details</Text>
              <View style={styles.inputWrap}>
                <Icon name="map-marker" size={13} color="rgba(255,255,255,0.3)" style={{ marginRight: 2 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Delivery address (estate, building, room)"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
              <View style={styles.inputWrap}>
                <Icon name="mobile" size={15} color="rgba(255,255,255,0.3)" />
                <TextInput
                  style={styles.input}
                  placeholder="M-Pesa number (0712...)"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={13}
                />
              </View>
            </View>
          </ScrollView>

          {/* Checkout bar */}
          <View style={[styles.checkoutBar, { bottom: insets.bottom + 16 }]}>
            <View style={styles.checkoutTotals}>
              <View style={styles.checkoutRow}>
                <Text style={styles.checkoutLabel}>Subtotal</Text>
                <Text style={styles.checkoutValue}>KES {total}</Text>
              </View>
              <View style={styles.checkoutRow}>
                <Text style={styles.checkoutLabel}>Delivery</Text>
                <Text style={styles.checkoutValue}>KES {DELIVERY_FEE}</Text>
              </View>
              <View style={[styles.checkoutRow, { marginTop: 4 }]}>
                <Text style={[styles.checkoutLabel, { color: '#fff', fontWeight: '700' }]}>Total</Text>
                <Text style={[styles.checkoutValue, { color: theme.colors.primary, fontSize: 16, fontWeight: '800' }]}>
                  KES {grandTotal}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.payBtn, { backgroundColor: theme.colors.primary }]}
              onPress={handleProceed}
              activeOpacity={0.85}
            >
              <Text style={styles.payBtnText}>Proceed to Pay</Text>
              <Icon name="arrow-right" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12, gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#fff' },
  clearBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  // Empty
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  emptySub: { fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center' },
  browseBtn: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  browseBtnText: { fontSize: 13, fontWeight: '700' },

  // Shop group
  shopGroup: { gap: 8 },
  shopGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shopGroupDot: { width: 8, height: 8, borderRadius: 4 },
  shopGroupName: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },

  // Cart item
  cartItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 11, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  cartItemIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cartItemBody: { flex: 1, minWidth: 0 },
  cartItemName: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  cartItemPrice: { fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  cartItemControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  qtyNum: { fontSize: 13, fontWeight: '700', color: '#fff', minWidth: 16, textAlign: 'center' },
  cartItemTotal: { fontSize: 12, fontWeight: '700', color: '#fff', minWidth: 60, textAlign: 'right' },

  // Form
  formSection: { gap: 10 },
  formTitle: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: 2 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 11,
  },
  input: { flex: 1, fontSize: 13, color: '#fff', padding: 0 },

  // Checkout bar
  checkoutBar: {
    position: 'absolute', left: 16, right: 16,
    backgroundColor: 'rgba(11,11,13,0.98)',
    borderRadius: 18, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    padding: 14, gap: 12,
  },
  checkoutTotals: { gap: 4 },
  checkoutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkoutLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  checkoutValue: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  payBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 13,
  },
  payBtnText: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },

  // Confirm step
  confirmCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14, gap: 10,
  },
  confirmSectionTitle: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  confirmItemName: { flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  confirmItemMeta: { fontSize: 11, color: 'rgba(255,255,255,0.3)' },
  confirmItemPrice: { fontSize: 12, fontWeight: '600', color: '#fff', minWidth: 70, textAlign: 'right' },
  confirmDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 4 },
  confirmLabel: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  confirmValue: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  mpesaNotice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1,
    backgroundColor: 'rgba(34,197,94,0.06)',
  },
  mpesaTitle: { fontSize: 13, fontWeight: '700', color: '#22C55E', marginBottom: 3 },
  mpesaSub: { fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 16 },

  // Success
  successWrap: { alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  successIcon: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 1.5, borderColor: 'rgba(34,197,94,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  successSub: { fontSize: 13, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 20 },
  successBtn: {
    marginTop: 12, paddingHorizontal: 28,
    paddingVertical: 14, borderRadius: 14,
  },
  successBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});