// src/screens/provider/ShowcaseScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../utils/theme';

const { width } = Dimensions.get('window');
const CARD_W = (width - theme.spacing.lg * 2 - 12) / 2;

// Dummy showcase items
const DUMMY_ITEMS = [
  { id: '1', name: 'Phone Screen Repair', price: 'KSh 1,500', category: 'Repair', available: true },
  { id: '2', name: 'Battery Replacement', price: 'KSh 800', category: 'Repair', available: true },
  { id: '3', name: 'Laptop Servicing', price: 'KSh 2,000', category: 'Service', available: false },
  { id: '4', name: 'Data Recovery', price: 'KSh 3,500', category: 'Service', available: true },
];

export default function ShowcaseScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState(DUMMY_ITEMS);
  const [view, setView] = useState('grid'); // grid | list

  const toggleAvailability = (id) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  const handleDelete = (id) => {
    Alert.alert('Remove Item', 'Remove this item from your showcase?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setItems(prev => prev.filter(i => i.id !== id)) },
    ]);
  };

  const handleAddItem = () => {
    Alert.alert('Add Item', 'Item creation form coming soon.');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} translucent />
      
      {/* Header - ZERO padding top */}
      <View style={[styles.header, { marginTop: Platform.OS === 'ios' ? insets.top : 0 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Showcase</Text>
          <Text style={styles.headerSub}>{items.length} items</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setView(v => v === 'grid' ? 'list' : 'grid')}
            activeOpacity={0.7}
          >
            <Ionicons name={view === 'grid' ? 'list-outline' : 'grid-outline'} size={17} color={theme.colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddItem} activeOpacity={0.8}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addBtnGradient}
            >
              <Ionicons name="add" size={17} color="#fff" />
              <Text style={styles.addBtnText}>Add</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={14} color={theme.colors.primary} />
        <Text style={styles.infoText}>
          Customers browse these items and contact you to purchase. No checkout required.
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="images-outline" size={32} color={theme.colors.textDim} />
            </View>
            <Text style={styles.emptyTitle}>No items yet</Text>
            <Text style={styles.emptyDesc}>Add products or services to let customers know what you offer</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={handleAddItem} activeOpacity={0.8}>
              <Ionicons name="add-circle-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.emptyBtnText}>Add your first item</Text>
            </TouchableOpacity>
          </View>
        ) : view === 'grid' ? (
          <View style={styles.grid}>
            {items.map(item => (
              <View key={item.id} style={[styles.gridCard, !item.available && styles.cardDimmed]}>
                {/* Image placeholder */}
                <View style={styles.gridImg}>
                  <Ionicons name="image-outline" size={28} color={theme.colors.textDim} />
                  {!item.available && (
                    <View style={styles.unavailableOverlay}>
                      <Text style={styles.unavailableText}>Unavailable</Text>
                    </View>
                  )}
                </View>
                <View style={styles.gridInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                  <View style={styles.itemCatBadge}>
                    <Text style={styles.itemCatText}>{item.category}</Text>
                  </View>
                </View>
                <View style={styles.gridActions}>
                  <TouchableOpacity
                    style={[styles.gridActionBtn, { backgroundColor: item.available ? theme.colors.success + '12' : theme.colors.surfaceLight }]}
                    onPress={() => toggleAvailability(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.available ? 'checkmark-circle-outline' : 'close-circle-outline'}
                      size={13}
                      color={item.available ? theme.colors.success : theme.colors.textDim}
                    />
                    <Text style={[styles.gridActionText, { color: item.available ? theme.colors.success : theme.colors.textDim }]}>
                      {item.available ? 'Active' : 'Off'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn} activeOpacity={0.7}>
                    <Ionicons name="trash-outline" size={13} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {/* Add card */}
            <TouchableOpacity style={styles.addCard} onPress={handleAddItem} activeOpacity={0.75}>
              <Ionicons name="add-circle-outline" size={28} color={theme.colors.textDim} />
              <Text style={styles.addCardText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((item, i) => (
              <View key={item.id} style={[styles.listCard, i === items.length - 1 && styles.listCardLast]}>
                <View style={styles.listImg}>
                  <Ionicons name="image-outline" size={20} color={theme.colors.textDim} />
                </View>
                <View style={styles.listInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.listMeta}>
                    <Text style={styles.itemPrice}>{item.price}</Text>
                    <View style={styles.itemCatBadge}>
                      <Text style={styles.itemCatText}>{item.category}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.listActions}>
                  <TouchableOpacity onPress={() => toggleAvailability(item.id)} activeOpacity={0.7}>
                    <Ionicons
                      name={item.available ? 'eye-outline' : 'eye-off-outline'}
                      size={18}
                      color={item.available ? theme.colors.success : theme.colors.textDim}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} activeOpacity={0.7}>
                    <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    // ZERO padding top - absolute zero space
  },
  backBtn: {
    width: 36, 
    height: 36, 
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1, 
    borderColor: theme.colors.border,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  headerTitle: { 
    fontSize: theme.fontSizes.lg, 
    fontWeight: '800', 
    color: theme.colors.text 
  },
  headerSub: { 
    fontSize: theme.fontSizes.xs, 
    color: theme.colors.textDim 
  },
  headerActions: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  viewToggle: {
    width: 36, 
    height: 36, 
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1, 
    borderColor: theme.colors.border,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  addBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  addBtnGradient: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 5,
    paddingHorizontal: 14, 
    paddingVertical: 8,
  },
  addBtnText: { 
    fontSize: theme.fontSizes.sm, 
    fontWeight: '700', 
    color: '#fff' 
  },
  infoBanner: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    paddingHorizontal: theme.spacing.lg, 
    paddingVertical: 10,
    backgroundColor: theme.colors.primarySurface,
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.primaryBorder,
  },
  infoText: { 
    flex: 1, 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.primary, 
    fontWeight: '500' 
  },
  scroll: { 
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  emptyState: { 
    alignItems: 'center', 
    paddingVertical: 48, 
    gap: 12 
  },
  emptyIcon: {
    width: 72, 
    height: 72, 
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1, 
    borderColor: theme.colors.border,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  emptyTitle: { 
    fontSize: theme.fontSizes.lg, 
    fontWeight: '700', 
    color: theme.colors.text 
  },
  emptyDesc: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textMuted, 
    textAlign: 'center', 
    lineHeight: 20, 
    maxWidth: 260 
  },
  emptyBtn: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    backgroundColor: theme.colors.primarySurface,
    borderWidth: 1, 
    borderColor: theme.colors.primaryBorder,
    paddingHorizontal: 20, 
    paddingVertical: 11, 
    borderRadius: 20, 
    marginTop: 8,
  },
  emptyBtnText: { 
    fontSize: theme.fontSizes.sm, 
    fontWeight: '700', 
    color: theme.colors.primary 
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12 
  },
  gridCard: {
    width: CARD_W,
    backgroundColor: theme.colors.surface,
    borderWidth: 1, 
    borderColor: theme.colors.border,
    borderRadius: 18, 
    overflow: 'hidden',
  },
  cardDimmed: { 
    opacity: 0.6 
  },
  gridImg: {
    height: CARD_W * 0.65,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center', 
    justifyContent: 'center',
    position: 'relative',
  },
  unavailableOverlay: {
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 4, 
    alignItems: 'center',
  },
  unavailableText: { 
    fontSize: 10, 
    fontWeight: '700', 
    color: 'rgba(255,255,255,0.7)' 
  },
  gridInfo: { 
    padding: 10, 
    gap: 4 
  },
  itemName: { 
    fontSize: theme.fontSizes.sm, 
    fontWeight: '700', 
    color: theme.colors.text 
  },
  itemPrice: { 
    fontSize: theme.fontSizes.sm, 
    fontWeight: '800', 
    color: theme.colors.primary 
  },
  itemCatBadge: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 7, 
    paddingVertical: 2,
    borderRadius: 6, 
    alignSelf: 'flex-start',
  },
  itemCatText: { 
    fontSize: 9, 
    fontWeight: '600', 
    color: theme.colors.textMuted, 
    textTransform: 'uppercase' 
  },
  gridActions: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 10, 
    paddingBottom: 10, 
    gap: 6,
  },
  gridActionBtn: {
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
    paddingHorizontal: 8, 
    paddingVertical: 5, 
    borderRadius: 8,
  },
  gridActionText: { 
    fontSize: 10, 
    fontWeight: '700' 
  },
  deleteBtn: {
    width: 28, 
    height: 28, 
    borderRadius: 8,
    backgroundColor: theme.colors.error + '12',
    alignItems: 'center', 
    justifyContent: 'center',
  },
  addCard: {
    width: CARD_W,
    height: CARD_W * 1.1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5, 
    borderColor: theme.colors.border,
    borderRadius: 18, 
    borderStyle: 'dashed',
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8,
  },
  addCardText: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textDim, 
    fontWeight: '600' 
  },
  list: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1, 
    borderColor: theme.colors.border,
    borderRadius: 20, 
    overflow: 'hidden',
  },
  listCard: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
    padding: 14,
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.border,
  },
  listCardLast: { 
    borderBottomWidth: 0 
  },
  listImg: {
    width: 48, 
    height: 48, 
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  listInfo: { 
    flex: 1, 
    gap: 4 
  },
  listMeta: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  listActions: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 14 
  },
});