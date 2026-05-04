// src/screens/marketplace/MarketplaceScreen.js
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import theme from '../../utils/theme';
import { SHOP_CATEGORIES, DUMMY_SHOPS } from './constants';

const { width, height } = Dimensions.get('window');

const NAIROBI = {
  latitude: -1.2921,
  longitude: 36.8219,
  latitudeDelta: 0.045,
  longitudeDelta: 0.045,
};

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0e0e10' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#3a3a3a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0e0e10' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a1e' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#1e1e24' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#242430' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#080c12' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#111116' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0f1410' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#131316' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#1c1c22' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
];

const CARD_WIDTH = width * 0.72;
const SNAP_INTERVAL = CARD_WIDTH + 12;

const ShopPin = ({ shop, selected, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
    <View style={[
      styles.pinOuter,
      { borderColor: shop.color + '70', backgroundColor: 'rgba(9,9,11,0.92)' },
      selected && { borderColor: shop.color, backgroundColor: shop.color + '22' },
    ]}>
      <Icon name={shop.icon} size={11} color={shop.color} />
      <Text style={[styles.pinLabel, { color: selected ? shop.color : 'rgba(255,255,255,0.75)' }]}>
        {shop.name.split(' ')[0]}
      </Text>
    </View>
  </TouchableOpacity>
);

const ShopCard = ({ shop, selected, onPress, onNavigate }) => (
  <TouchableOpacity
    style={[
      styles.shopCard,
      selected && { borderColor: shop.color + '55', backgroundColor: 'rgba(255,255,255,0.05)' },
    ]}
    onPress={() => onPress(shop)}
    activeOpacity={0.85}
  >
    {selected && <View style={[styles.cardAccent, { backgroundColor: shop.color }]} />}

    <View style={[styles.shopAvatar, { backgroundColor: shop.color + '1a' }]}>
      <Icon name={shop.icon} size={18} color={shop.color} />
    </View>

    <View style={styles.shopCardBody}>
      <View style={styles.shopCardTop}>
        <Text style={styles.shopCardName} numberOfLines={1}>{shop.name}</Text>
        {shop.isVerified && (
          <Icon name="check-circle" size={12} color="#22C55E" style={{ marginLeft: 4 }} />
        )}
      </View>
      <View style={styles.shopCardMeta}>
        <Icon name="map-marker" size={9} color="rgba(255,255,255,0.3)" />
        <Text style={styles.shopCardDist}>{shop.distance}</Text>
        <View style={[styles.statusDot, { backgroundColor: shop.isOpen ? '#22C55E' : 'rgba(255,255,255,0.2)' }]} />
        <Text style={[styles.shopStatus, { color: shop.isOpen ? '#22C55E' : 'rgba(255,255,255,0.3)' }]}>
          {shop.isOpen ? 'Open' : 'Closed'}
        </Text>
        <Icon name="star" size={9} color="#EAB308" />
        <Text style={styles.shopRating}>{shop.rating}</Text>
      </View>
      <Text style={styles.shopCardDesc} numberOfLines={1}>{shop.description}</Text>
    </View>

    <TouchableOpacity
      style={[styles.enterBtn, { borderColor: shop.color + '40' }]}
      onPress={() => onNavigate(shop)}
      activeOpacity={0.8}
    >
      <Icon name="chevron-right" size={13} color={shop.color} />
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function MarketplaceScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedShop, setSelectedShop] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sheetAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredShops = activeCategory === 'all'
    ? DUMMY_SHOPS
    : DUMMY_SHOPS.filter(s => s.category === activeCategory);

  const showSheet = useCallback(() => {
    setSheetVisible(true);
    setIsCollapsed(false);
    Animated.spring(sheetAnim, { toValue: 1, tension: 55, friction: 11, useNativeDriver: true }).start();
  }, []);

  const hideSheet = useCallback(() => {
    Animated.timing(sheetAnim, { toValue: 0, duration: 240, useNativeDriver: true }).start(() => {
      setSheetVisible(false);
      setSelectedShop(null);
    });
  }, []);

  const toggleCollapse = useCallback(() => {
    const target = isCollapsed ? 1 : 0.3;
    Animated.spring(sheetAnim, { toValue: target, tension: 65, friction: 12, useNativeDriver: true }).start();
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed]);

  const handleCategoryPress = useCallback((catId) => {
    Haptics.selectionAsync();
    setActiveCategory(catId);
    setSelectedShop(null);
    if (catId !== 'all') {
      showSheet();
    } else {
      hideSheet();
    }
  }, [showSheet, hideSheet]);

  const handlePinPress = useCallback((shop) => {
    Haptics.selectionAsync();
    setSelectedShop(shop);
    setActiveCategory(shop.category);
    showSheet();
    mapRef.current?.animateToRegion({
      latitude: shop.coordinates.latitude - 0.006,
      longitude: shop.coordinates.longitude,
      latitudeDelta: 0.028,
      longitudeDelta: 0.028,
    }, 400);
    // Scroll card list to this shop
    const idx = filteredShops.findIndex(s => s.id === shop.id);
    if (idx >= 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: idx * SNAP_INTERVAL, animated: true });
        setCurrentIndex(idx);
      }, 350);
    }
  }, [filteredShops]);

  const handleCardPress = useCallback((shop) => {
    Haptics.selectionAsync();
    setSelectedShop(shop);
    mapRef.current?.animateToRegion({
      latitude: shop.coordinates.latitude - 0.006,
      longitude: shop.coordinates.longitude,
      latitudeDelta: 0.028,
      longitudeDelta: 0.028,
    }, 400);
  }, []);

  const handleNavigateToShop = useCallback((shop) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Shop', { shop });
  }, [navigation]);

  const onMomentumScrollEnd = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    setCurrentIndex(idx);
    if (filteredShops[idx]) {
      setSelectedShop(filteredShops[idx]);
    }
  };

  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [height * 0.85, height * 0.62, 0],
  });

  const catColor = SHOP_CATEGORIES.find(c => c.id === activeCategory)?.color ?? theme.colors.primary;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={NAIROBI}
        customMapStyle={DARK_MAP_STYLE}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        onPress={sheetVisible && !isCollapsed ? toggleCollapse : undefined}
      >
        {filteredShops.map(shop => (
          <React.Fragment key={shop.id}>
            <Marker
              coordinate={shop.coordinates}
              anchor={{ x: 0.5, y: 0.5 }}
              zIndex={selectedShop?.id === shop.id ? 50 : 10}
              onPress={() => handlePinPress(shop)}
            >
              <ShopPin
                shop={shop}
                selected={selectedShop?.id === shop.id}
                onPress={() => handlePinPress(shop)}
              />
            </Marker>
            {selectedShop?.id === shop.id && (
              <Circle
                center={shop.coordinates}
                radius={shop.deliveryRadiusKm * 1000}
                fillColor={shop.color + '10'}
                strokeColor={shop.color + '40'}
                strokeWidth={1.5}
              />
            )}
          </React.Fragment>
        ))}
      </MapView>

      {/* Header */}
      <View style={[styles.headerWrap, { paddingTop: insets.top + 5 }]} pointerEvents="box-none">
        {Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="dark" style={styles.headerBlur}>
            <HeaderContent catColor={catColor} activeCategory={activeCategory} filteredShops={filteredShops} />
          </BlurView>
        ) : (
          <View style={[styles.headerBlur, { backgroundColor: 'rgba(9,9,11,0.88)' }]}>
            <HeaderContent catColor={catColor} activeCategory={activeCategory} filteredShops={filteredShops} />
          </View>
        )}
      </View>

      {/* Category chips */}
      <View style={[styles.chipsWrap, { bottom: sheetVisible ? height * 0.47 : insets.bottom + 20 }]}>
        <FlatList
          data={SHOP_CATEGORIES}
          keyExtractor={i => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                { borderColor: item.color + '35' },
                activeCategory === item.id && { borderColor: item.color, backgroundColor: item.color + '18' },
              ]}
              onPress={() => handleCategoryPress(item.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.chipIcon, { backgroundColor: item.color + '20' }]}>
                <Icon name={item.icon} size={12} color={item.color} />
              </View>
              <Text style={[styles.chipLabel, activeCategory === item.id && { color: item.color }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Bottom sheet */}
      {sheetVisible && (
        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: insets.bottom + 10,
              transform: [{ translateY: sheetTranslateY }],
              maxHeight: isCollapsed ? height * 0.2 : height * 0.48,
            },
          ]}
        >
          <TouchableOpacity onPress={toggleCollapse} style={styles.handleArea}>
            <View style={[styles.handle, isCollapsed && { backgroundColor: catColor + '60' }]} />
          </TouchableOpacity>

          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>
                {SHOP_CATEGORIES.find(c => c.id === activeCategory)?.label ?? 'Shops'} Nearby
              </Text>
              <Text style={styles.sheetSub}>{filteredShops.length} shops in your area</Text>
            </View>
            <TouchableOpacity onPress={hideSheet} style={styles.closeBtn}>
              <Icon name="times" size={12} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          </View>

          {!isCollapsed && (
            <>
              <FlatList
                ref={flatListRef}
                data={filteredShops}
                keyExtractor={i => i.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                contentContainerStyle={styles.cardList}
                onMomentumScrollEnd={onMomentumScrollEnd}
                renderItem={({ item }) => (
                  <View style={{ width: CARD_WIDTH, marginRight: 12 }}>
                    <ShopCard
                      shop={item}
                      selected={selectedShop?.id === item.id}
                      onPress={handleCardPress}
                      onNavigate={handleNavigateToShop}
                    />
                  </View>
                )}
              />
              {/* Pagination dots */}
              <View style={styles.dots}>
                {filteredShops.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === currentIndex && { width: 18, backgroundColor: catColor },
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const HeaderContent = ({ catColor, activeCategory, filteredShops }) => (
  <View style={styles.headerContent}>
    <View style={styles.headerLeft}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>R</Text>
      </View>
      <View>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <Text style={styles.headerSub}>Shops around you</Text>
      </View>
    </View>
    <View style={[styles.headerBadge, { backgroundColor: catColor + '18', borderColor: catColor + '35' }]}>
      <Icon name="shopping-bag" size={11} color={catColor} />
      <Text style={[styles.headerBadgeText, { color: catColor }]}>
        {filteredShops.length} shops
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },

  // Header
  headerWrap: {
    position: 'absolute', top: 0, left: 0, right: 0,
    zIndex: 20, paddingHorizontal: 12, paddingBottom: 10,
  },
  headerBlur: {
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)', overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 1 },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1,
  },
  headerBadgeText: { fontSize: 11, fontWeight: '700' },

  // Map pin
  pinOuter: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 5,
    borderRadius: 10, borderWidth: 1,
  },
  pinLabel: { fontSize: 10, fontWeight: '600' },

  // Category chips
  chipsWrap: { position: 'absolute', left: 0, right: 0, zIndex: 15 },
  chipsScroll: { paddingHorizontal: 12, gap: 8, paddingVertical: 2 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(10,10,12,0.9)',
    borderWidth: 1, borderRadius: 12,
    paddingVertical: 8, paddingLeft: 8, paddingRight: 10,
  },
  chipIcon: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  chipLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },

  // Sheet
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(9,9,11,0.97)',
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    zIndex: 30,
  },
  handleArea: { paddingVertical: 10, alignItems: 'center' },
  handle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  sheetSub: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  closeBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardList: { paddingHorizontal: 16, paddingBottom: 4 },

  // Shop card
  shopCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    gap: 11, overflow: 'hidden',
  },
  cardAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, borderRadius: 2 },
  shopAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  shopCardBody: { flex: 1, minWidth: 0, gap: 3 },
  shopCardTop: { flexDirection: 'row', alignItems: 'center' },
  shopCardName: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.9)', flex: 1 },
  shopCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  shopCardDist: { fontSize: 10, color: 'rgba(255,255,255,0.35)' },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  shopStatus: { fontSize: 10, fontWeight: '600' },
  shopRating: { fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },
  shopCardDesc: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 },
  enterBtn: {
    width: 32, height: 32, borderRadius: 10,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  // Pagination
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
});