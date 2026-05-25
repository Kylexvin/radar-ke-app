// src/screens/scan/ProviderDetailScreen.js
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { FontAwesome as Icon } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import theme from '../../utils/theme';

const { width } = Dimensions.get('window');

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
];

const DUMMY_REVIEWS = [
  { id: 'r1', name: 'James K.', initial: 'J', rating: 5, text: 'Very professional and fast. Fixed my issue in under an hour. Highly recommend.', date: '2 days ago' },
  { id: 'r2', name: 'Amina W.', initial: 'A', rating: 4, text: 'Good service, arrived on time. Pricing was fair. Will use again.', date: '5 days ago' },
  { id: 'r3', name: 'Brian O.', initial: 'B', rating: 5, text: 'Best in the area. Clean work and no hidden charges.', date: '1 week ago' },
];

const StarRow = ({ rating, size = 11 }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: full }).map((_, i) => (
        <Icon key={i} name="star" size={size} color={theme.colors.primary} />
      ))}
      {half && <Icon name="star-half-o" size={size} color={theme.colors.primary} />}
      {Array.from({ length: 5 - full - (half ? 1 : 0) }).map((_, i) => (
        <Icon key={`e${i}`} name="star-o" size={size} color={theme.colors.primary + '40'} />
      ))}
    </View>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={[styles.infoIconWrap, { backgroundColor: theme.colors.primary + '18' }]}>
      <Icon name={icon} size={13} color="#fff" />
    </View>
    <View style={styles.infoTextWrap}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

export default function ProviderDetailScreen({ route, navigation }) {
  const { provider } = route.params;
  const insets = useSafeAreaInsets();
  const [showAllReviews, setShowAllReviews] = useState(false);

  const reviews = DUMMY_REVIEWS;
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 2);

  const hasShowcase = provider.capabilities?.hasShowcase ?? false;
  const hasShop = provider.capabilities?.hasShop ?? false;
  const canBrowse = hasShowcase || hasShop;

  const browseLabel = hasShop ? 'View Shop' : 'View Showcase';
  const browseIcon = hasShop ? 'shopping-cart' : 'th-large';

  const handleCall = useCallback(() => {
    if (!provider.phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      `Call ${provider.name}`,
      provider.phone,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${provider.phone}`) },
      ]
    );
  }, [provider]);

  const handleWhatsApp = useCallback(() => {
    if (!provider.phone && !provider.whatsapp) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const num = (provider.whatsapp || provider.phone).replace(/\D/g, '');
    Linking.openURL(`whatsapp://send?phone=${num}`).catch(() =>
      Linking.openURL(`https://wa.me/${num}`)
    );
  }, [provider]);

  const handleDirections = useCallback(() => {
    if (!provider.coordinates) return;
    const { latitude, longitude } = provider.coordinates;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
  }, [provider]);

const handleBrowseShowcase = useCallback(() => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  if (hasShop) {
    navigation.navigate('Shop', { providerId: provider.id, provider });
  } else {
    navigation.navigate('ProviderShowcase', { provider });
  }
}, [provider, hasShop, navigation]);

  const hasCoords = provider.coordinates?.latitude && provider.coordinates?.longitude;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + (canBrowse ? 140 : 100) }}
      >
        {/* Hero Section - ZERO padding top */}
        <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
          <View style={[styles.heroAvatar, { backgroundColor: theme.colors.primary + '18', borderColor: theme.colors.primary + '35' }]}>
            <Icon name={provider.icon ?? 'user'} size={40} color={theme.colors.primary} />
          </View>

          <View style={styles.heroMeta}>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroName}>{provider.name}</Text>
              {provider.isVerified && (
                <View style={styles.verifiedPill}>
                  <Icon name="check-circle" size={10} color={theme.colors.success} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>

            <View style={[styles.catPill, { backgroundColor: theme.colors.primary + '18', borderColor: theme.colors.primary + '30' }]}>
              <Icon name={provider.icon ?? 'wrench'} size={10} color={theme.colors.primary} />
              <Text style={[styles.catPillText, { color: theme.colors.primary }]}>
                {provider.category?.charAt(0).toUpperCase() + provider.category?.slice(1)}
              </Text>
            </View>

            <View style={styles.heroStats}>
              <StarRow rating={provider.rating ?? 4.5} size={12} />
              <Text style={styles.heroRatingVal}>{provider.rating ?? '4.5'}</Text>
              <View style={styles.heroDot} />
              <Icon name="map-marker" size={11} color="rgba(255,255,255,0.35)" />
              <Text style={styles.heroDist}>{provider.distance}</Text>
              <View style={styles.heroDot} />
              <View style={[
                styles.statusPill,
                provider.isActive
                  ? { backgroundColor: theme.colors.success + '12' }
                  : { backgroundColor: 'rgba(255,255,255,0.06)' },
              ]}>
                <View style={[styles.statusDot, { backgroundColor: provider.isActive ? theme.colors.success : 'rgba(255,255,255,0.25)' }]} />
                <Text style={[styles.statusText, { color: provider.isActive ? theme.colors.success : 'rgba(255,255,255,0.35)' }]}>
                  {provider.isActive ? 'Available' : 'Unavailable'}
                </Text>
              </View>
            </View>

            {canBrowse && (
              <View style={styles.capPillsRow}>
                {hasShowcase && (
                  <View style={styles.capPill}>
                    <Icon name="th-large" size={9} color={theme.colors.primary} />
                    <Text style={styles.capPillText}>Showcase</Text>
                  </View>
                )}
                {hasShop && (
                  <View style={[styles.capPill, { backgroundColor: 'rgba(255,140,0,0.1)', borderColor: 'rgba(255,140,0,0.25)' }]}>
                    <Icon name="shopping-cart" size={9} color={theme.colors.warning} />
                    <Text style={[styles.capPillText, { color: theme.colors.warning }]}>Orders</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionSecondary, { borderColor: '#25D36640' }]}
            onPress={handleWhatsApp}
            activeOpacity={0.8}
          >
            <Icon name="whatsapp" size={16} color="#25D366" />
            <Text style={[styles.actionSecondaryText, { color: '#25D366' }]}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionSecondary, { borderColor: 'rgba(255,255,255,0.1)' }]}
            onPress={handleDirections}
            activeOpacity={0.8}
          >
            <Icon name="location-arrow" size={14} color="rgba(255,255,255,0.55)" />
            <Text style={styles.actionSecondaryText}>Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.infoCard}>
            <InfoRow icon="map-marker" label="Location" value={provider.address ?? 'Nairobi, Kenya'} />
            <View style={styles.infoSep} />
            <InfoRow icon="arrows-alt" label="Service Reach" value={`${provider.radiusKm ?? 5}km radius`} />
            <View style={styles.infoSep} />
            <InfoRow
              icon="circle"
              label="Status"
              value={provider.isActive ? 'Available now' : 'Currently unavailable'}
            />
            {provider.phone && (
              <>
                <View style={styles.infoSep} />
                <InfoRow icon="phone" label="Phone" value={provider.phone} />
              </>
            )}
          </View>
        </View>

        {/* Showcase Preview */}
        {canBrowse && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>
  {hasShop ? 'Shop' : 'Showcase'}
</Text>
              <TouchableOpacity onPress={handleBrowseShowcase} activeOpacity={0.75}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See all →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewScroll}>
              {[
                { name: 'Item One', price: 'KSh 500' },
                { name: 'Item Two', price: 'KSh 1,200' },
                { name: 'Item Three', price: 'KSh 800' },
              ].map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.previewCard}
                  onPress={handleBrowseShowcase}
                  activeOpacity={0.8}
                >
                  <View style={styles.previewImg}>
                    <Icon name="image" size={20} color="rgba(255,255,255,0.15)" />
                  </View>
                  <Text style={styles.previewName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.previewPrice}>{item.price}</Text>
                  {hasShop && (
                    <View style={styles.previewOrderBtn}>
                      <Text style={styles.previewOrderText}>Inquire</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.previewMore} onPress={handleBrowseShowcase} activeOpacity={0.8}>
                <Icon name="arrow-right" size={18} color={theme.colors.primary} />
                <Text style={[styles.previewMoreText, { color: theme.colors.primary }]}>View all</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Mini Map */}
        {hasCoords && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapCard}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.miniMap}
                customMapStyle={DARK_MAP_STYLE}
                initialRegion={{
                  latitude: provider.coordinates.latitude,
                  longitude: provider.coordinates.longitude,
                  latitudeDelta: 0.018,
                  longitudeDelta: 0.018,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                showsUserLocation={false}
                showsMyLocationButton={false}
                showsCompass={false}
                toolbarEnabled={false}
              >
                <Marker coordinate={provider.coordinates} anchor={{ x: 0.5, y: 0.5 }}>
                  <View style={[styles.mapPin, { borderColor: theme.colors.primary + '80', backgroundColor: 'rgba(9,9,11,0.92)' }]}>
                    <Icon name={provider.icon ?? 'map-marker'} size={13} color={theme.colors.primary} />
                  </View>
                </Marker>
                <Circle
                  center={provider.coordinates}
                  radius={(provider.radiusKm ?? 5) * 1000}
                  fillColor={theme.colors.primary + '0f'}
                  strokeColor={theme.colors.primary + '40'}
                  strokeWidth={1.5}
                />
              </MapView>
              <TouchableOpacity
                style={[styles.mapDirectionsBtn, { backgroundColor: theme.colors.primary + '18', borderColor: theme.colors.primary + '35' }]}
                onPress={handleDirections}
                activeOpacity={0.85}
              >
                <Icon name="location-arrow" size={12} color={theme.colors.primary} />
                <Text style={[styles.mapDirectionsBtnText, { color: theme.colors.primary }]}>Open in Maps</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={[styles.reviewSummaryPill, { borderColor: theme.colors.primary + '30' }]}>
              <Icon name="star" size={10} color={theme.colors.primary} />
              <Text style={styles.reviewSummaryText}>
                {provider.rating ?? '4.5'} · {reviews.length} reviews
              </Text>
            </View>
          </View>

          {displayedReviews.map((review, index) => (
            <View
              key={review.id}
              style={[styles.reviewCard, index < displayedReviews.length - 1 && { marginBottom: 10 }]}
            >
              <View style={styles.reviewTop}>
                <View style={[styles.reviewAvatar, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Text style={[styles.reviewInitial, { color: theme.colors.primary }]}>{review.initial}</Text>
                </View>
                <View style={styles.reviewMeta}>
                  <Text style={styles.reviewName}>{review.name}</Text>
                  <View style={styles.reviewStarRow}>
                    <StarRow rating={review.rating} size={10} />
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}

          {reviews.length > 2 && (
            <TouchableOpacity
              style={[styles.showMoreBtn, { borderColor: theme.colors.primary + '30' }]}
              onPress={() => setShowAllReviews(v => !v)}
            >
              <Text style={[styles.showMoreText, { color: theme.colors.primary }]}>
                {showAllReviews ? 'Show less' : `Show all ${reviews.length} reviews`}
              </Text>
              <Icon name={showAllReviews ? 'chevron-up' : 'chevron-down'} size={11} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        {canBrowse && (
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={handleBrowseShowcase}
            activeOpacity={0.85}
          >
            <Icon name={browseIcon} size={15} color={theme.colors.primary} />
            <Text style={styles.browseBtnText}>{browseLabel}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.callBtn, !canBrowse && styles.callBtnFull]}
          onPress={handleCall}
          activeOpacity={0.85}
        >
          <Icon name="phone" size={16} color="#fff" />
          <Text style={styles.callBtnText}>Call Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },

  hero: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  heroAvatar: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, flexShrink: 0,
  },
  heroMeta: { flex: 1, gap: 6, paddingTop: 4 },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  heroName: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  verifiedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: theme.colors.success + '12',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
  },
  verifiedText: { fontSize: 9, color: theme.colors.success, fontWeight: '700' },
  catPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 7, borderWidth: 1,
  },
  catPillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  heroRatingVal: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  heroDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.2)' },
  heroDist: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 10, fontWeight: '600' },
  capPillsRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  capPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: theme.colors.primarySurface,
    borderWidth: 1, borderColor: theme.colors.primaryBorder,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  capPillText: { fontSize: 9, fontWeight: '700', color: theme.colors.primary, textTransform: 'uppercase', letterSpacing: 0.3 },

  actionsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 24 },
  actionSecondary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, paddingVertical: 11, borderRadius: 12, borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  actionSecondaryText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.55)' },

  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.45)',
    marginBottom: 10, letterSpacing: 0.3, textTransform: 'uppercase',
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  seeAllText: { fontSize: 12, fontWeight: '700' },

  previewScroll: { gap: 10, paddingRight: 4 },
  previewCard: {
    width: 120,
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: 14, overflow: 'hidden',
  },
  previewImg: {
    height: 80,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center', justifyContent: 'center',
  },
  previewName: {
    fontSize: theme.fontSizes.sm, fontWeight: '700',
    color: theme.colors.text, paddingHorizontal: 10, paddingTop: 8,
  },
  previewPrice: {
    fontSize: theme.fontSizes.sm, fontWeight: '800',
    color: theme.colors.primary, paddingHorizontal: 10, paddingBottom: 4,
  },
  previewOrderBtn: {
    marginHorizontal: 10, marginBottom: 10,
    backgroundColor: theme.colors.primarySurface,
    borderWidth: 1, borderColor: theme.colors.primaryBorder,
    borderRadius: 8, paddingVertical: 5, alignItems: 'center',
  },
  previewOrderText: { fontSize: 10, fontWeight: '700', color: theme.colors.primary },
  previewMore: {
    width: 80,
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    gap: 6,
  },
  previewMoreText: { fontSize: 11, fontWeight: '700' },

  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)', overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingHorizontal: 14, paddingVertical: 13,
  },
  infoIconWrap: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: '500', marginBottom: 2 },
  infoValue: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  infoSep: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 58 },

  mapCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', height: 200 },
  miniMap: { ...StyleSheet.absoluteFillObject },
  mapPin: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, borderWidth: 1,
  },
  mapDirectionsBtn: {
    position: 'absolute', bottom: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
  },
  mapDirectionsBtnText: { fontSize: 11, fontWeight: '700' },

  reviewSummaryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: theme.colors.primary + '10',
    borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  reviewSummaryText: { fontSize: 10, color: theme.colors.primary, fontWeight: '600' },
  reviewCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', padding: 14, gap: 10,
  },
  reviewTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  reviewAvatar: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  reviewInitial: { fontSize: 14, fontWeight: '800' },
  reviewMeta: { flex: 1, gap: 3 },
  reviewName: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  reviewStarRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reviewDate: { fontSize: 10, color: 'rgba(255,255,255,0.28)' },
  reviewText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 18 },
  showMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 10, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
  },
  showMoreText: { fontSize: 12, fontWeight: '600' },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: 'rgba(10,10,10,0.97)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
  },
  browseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, paddingVertical: 15, paddingHorizontal: 16, borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.primaryBorder,
    backgroundColor: theme.colors.primarySurface,
  },
  browseBtnText: { fontSize: 13, fontWeight: '700', color: theme.colors.primary },
  callBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 9, paddingVertical: 15, borderRadius: 14,
    backgroundColor: theme.colors.primary,
  },
  callBtnFull: { flex: 1 },
  callBtnText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
});