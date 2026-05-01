// src/screens/scan/components/ProviderCard.js
import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Linking } from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';

const ProviderCard = ({ item, selected, onPress, onWhatsAppPress }) => {
  const pressScale = useRef(new Animated.Value(1)).current;
  const [imageError, setImageError] = React.useState(false);

  const onPressIn = () =>
    Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true, speed: 35 }).start();
  const onPressOut = () =>
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 25 }).start();

  const handleWhatsApp = () => {
    if (item.whatsapp || item.phone) {
      const phoneNumber = (item.whatsapp || item.phone).replace(/\D/g, '');
      const url = `whatsapp://send?phone=${phoneNumber}`;
      Linking.openURL(url).catch(() => {
        Linking.openURL(`https://wa.me/${phoneNumber}`);
      });
    }
    onWhatsAppPress?.(item);
  };

  const handleViewDashboard = () => {
    onPress?.(item);
  };

  // Get category icon and color
  const getCategoryInfo = () => {
    const categoryMap = {
      'fundi': { icon: 'wrench', color: '#3B82F6' },
      'food': { icon: 'cutlery', color: '#F59E0B' },
      'bodaboda': { icon: 'motorcycle', color: '#10B981' },
      'salon': { icon: 'scissors', color: '#EC4899' },
      'tutor': { icon: 'graduation-cap', color: '#8B5CF6' },
      'delivery': { icon: 'truck', color: '#EF4444' },
      'health': { icon: 'heartbeat', color: '#06B6D4' },
    };
    return categoryMap[item.category] || { icon: 'cube', color: '#6B7280' };
  };

  const categoryInfo = getCategoryInfo();
  const displayIcon = item.icon || categoryInfo.icon;
  const displayColor = item.color || categoryInfo.color;

  return (
    <Animated.View style={{ transform: [{ scale: pressScale }] }}>
      <TouchableOpacity
        onPress={handleViewDashboard}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={[
          styles.card,
          selected && { borderColor: displayColor + '50', backgroundColor: 'rgba(255,255,255,0.05)' },
        ]}
      >
        {selected && <View style={[styles.cardAccent, { backgroundColor: displayColor }]} />}

        {/* Avatar with optional image support */}
        <View style={[styles.cardAvatar, { backgroundColor: displayColor + '18' }]}>
          {item.profileImage && !imageError ? (
            <Image 
              source={{ uri: item.profileImage }} 
              style={styles.avatarImage}
              onError={() => setImageError(true)}
            />
          ) : (
            <Icon name={displayIcon} size={16} color={displayColor} />
          )}
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          
          <View style={styles.cardRow}>
            {/* Distance */}
            <Icon name="map-marker" size={10} color="rgba(255,255,255,0.3)" />
            <Text style={styles.cardDist}>{item.distance}km</Text>

            {/* Status Badge */}
            <View style={[styles.badge, item.isActive ? styles.badgeOpen : styles.badgeBusy]}>
              <View style={[styles.badgeDot, { backgroundColor: item.isActive ? '#22C55E' : '#EAB308' }]} />
              <Text style={[styles.badgeText, { color: item.isActive ? '#22C55E' : '#EAB308' }]}>
                {item.isActive ? 'Open' : (item.isBusy ? 'Busy' : 'Closed')}
              </Text>
            </View>

            {/* Rating */}
            <View style={styles.ratingRow}>
              <Icon name="star" size={9} color="#EAB308" />
              <Text style={styles.ratingText}>{item.rating || '4.5'}</Text>
            </View>
          </View>

          {/* Additional info for dashboard view */}
          <View style={styles.dashboardInfo}>
            {item.verified && (
              <View style={styles.verifiedBadge}>
                <Icon name="check-circle" size={10} color="#22C55E" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
            {item.completedJobs && (
              <Text style={styles.completedJobs}>
                {item.completedJobs}+ jobs
              </Text>
            )}
          </View>
        </View>

        <View style={styles.cardRight}>
          {/* Reach/Radius */}
          <Text style={styles.reachText}>
            <Text style={styles.reachVal}>{item.radiusKm || item.serviceRadius || 5}km</Text>
            {'\n'}
            <Text style={styles.reachLabel}>reach</Text>
          </Text>

          {/* WhatsApp Button */}
          {(item.whatsapp || item.phone) && (
            <TouchableOpacity 
              style={styles.waBtn} 
              activeOpacity={0.75}
              onPress={handleWhatsApp}
            >
              <Icon name="whatsapp" size={15} color="#25D366" />
            </TouchableOpacity>
          )}

          {/* Dashboard Indicator */}
          <View style={styles.dashboardIndicator}>
            <Icon name="chevron-right" size={12} color="rgba(255,255,255,0.3)" />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    gap: 12,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: 2,
  },
  cardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  cardDist: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    gap: 4,
  },
  badgeOpen: {
    backgroundColor: 'rgba(34,197,94,0.1)',
  },
  badgeBusy: {
    backgroundColor: 'rgba(234,179,8,0.1)',
  },
  badgeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  dashboardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  verifiedText: {
    fontSize: 9,
    color: '#22C55E',
    fontWeight: '500',
  },
  completedJobs: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  reachText: {
    textAlign: 'right',
    lineHeight: 15,
  },
  reachVal: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  reachLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.28)',
  },
  waBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(37,211,102,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(37,211,102,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardIndicator: {
    marginTop: 2,
  },
});

export default ProviderCard;