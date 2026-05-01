// src/screens/scan/ProviderDetailScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import theme from '../../utils/theme';

const { width } = Dimensions.get('window');

const ProviderDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { provider } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleCall = () => {
    if (provider.phone) {
      Alert.alert(
        'Call Provider',
        `Call ${provider.name} at ${provider.phone}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => Linking.openURL(`tel:${provider.phone}`) }
        ]
      );
    } else {
      Alert.alert('No Phone Number', 'This provider has not listed a phone number.');
    }
  };

  const handleWhatsApp = () => {
    if (provider.phone) {
      const phone = provider.phone.replace(/[^0-9]/g, '');
      Linking.openURL(`whatsapp://send?phone=${phone}`);
    } else {
      Alert.alert('No Phone Number', 'Cannot open WhatsApp without a phone number.');
    }
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${provider.coordinates.latitude},${provider.coordinates.longitude}`;
    Linking.openURL(url);
  };

  const handleShare = () => {
    const message = `Check out ${provider.name} on Rada Ke!\n\n${provider.description}\n\nLocated at: ${provider.address}`;
    Linking.share(message);
  };

  const getCategoryColor = () => {
    const colors = {
      fundi: theme.colors.fundi,
      food: theme.colors.food,
      bodaboda: theme.colors.bodaboda,
      salon: theme.colors.salon,
      tutor: theme.colors.tutor,
      delivery: theme.colors.delivery,
      health: theme.colors.health,
    };
    return colors[provider.category] || theme.colors.primary;
  };

  const getCategoryIcon = () => {
    const icons = {
      fundi: 'construct-outline',
      food: 'restaurant-outline',
      bodaboda: 'bicycle-outline',
      salon: 'cut-outline',
      tutor: 'school-outline',
      delivery: 'cube-outline',
      health: 'medkit-outline',
    };
    return icons[provider.category] || 'business-outline';
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} name="star" size={16} color={theme.colors.warning} />);
    }
    if (hasHalfStar) {
      stars.push(<Icon key="half" name="star-half" size={16} color={theme.colors.warning} />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Icon key={`empty-${i}`} name="star-outline" size={16} color={theme.colors.warning} />);
    }
    return stars;
  };

  if (loading) {
    return <LoadingOverlay visible={true} message="Loading provider details..." />;
  }

  const categoryColor = getCategoryColor();
  const categoryIcon = getCategoryIcon();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Icon name="share-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}20` }]}>
            <Icon name={categoryIcon} size={60} color={categoryColor} />
          </View>
          <Text style={styles.providerName}>{provider.name}</Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>{renderStars(provider.rating)}</View>
            <Text style={styles.ratingText}>{provider.rating}</Text>
            <Text style={styles.reviewText}>({provider.reviewCount} reviews)</Text>
          </View>

          <View style={styles.statusRow}>
            {provider.isOpen ? (
              <View style={styles.openStatus}>
                <Icon name="checkmark-circle" size={14} color={theme.colors.success} />
                <Text style={styles.openText}>Open Now</Text>
              </View>
            ) : (
              <View style={styles.closedStatus}>
                <Icon name="close-circle" size={14} color={theme.colors.error} />
                <Text style={styles.closedText}>Closed</Text>
              </View>
            )}
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>{provider.priceLevel}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <View style={[styles.actionIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
              <Icon name="call-outline" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp}>
            <View style={[styles.actionIcon, { backgroundColor: '#25D36620' }]}>
              <Icon name="logo-whatsapp" size={24} color="#25D366" />
            </View>
            <Text style={styles.actionText}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
            <View style={[styles.actionIcon, { backgroundColor: `${theme.colors.info}20` }]}>
              <Icon name="navigate-outline" size={24} color={theme.colors.info} />
            </View>
            <Text style={styles.actionText}>Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Description Section */}
        <GlassCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>
            {showFullDescription 
              ? provider.description 
              : `${provider.description.substring(0, 150)}...`}
          </Text>
          {provider.description.length > 150 && (
            <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
              <Text style={styles.readMoreText}>
                {showFullDescription ? 'Read Less' : 'Read More'}
              </Text>
            </TouchableOpacity>
          )}
        </GlassCard>

        {/* Location Section */}
        <GlassCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationInfo}>
            <Icon name="location-outline" size={20} color={theme.colors.textMuted} />
            <Text style={styles.locationText}>{provider.address}</Text>
          </View>
          <View style={styles.distanceInfo}>
            <Icon name="navigate-outline" size={20} color={theme.colors.textMuted} />
            <Text style={styles.distanceText}>{provider.distance} km from your location</Text>
          </View>
          
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: provider.coordinates.latitude,
                longitude: provider.coordinates.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={provider.coordinates}
                title={provider.name}
              >
                <View style={[styles.mapMarker, { borderColor: categoryColor }]}>
                  <Icon name={categoryIcon} size={16} color={categoryColor} />
                </View>
              </Marker>
            </MapView>
            <TouchableOpacity style={styles.viewMapButton} onPress={handleDirections}>
              <Text style={styles.viewMapText}>View Full Map</Text>
              <Icon name="arrow-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Contact Section */}
        <GlassCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.contactItem}>
            <View style={styles.contactIconContainer}>
              <Icon name="call-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Phone Number</Text>
              <Text style={styles.contactValue}>{provider.phone || 'Not provided'}</Text>
            </View>
            {provider.phone && (
              <TouchableOpacity onPress={handleCall}>
                <Icon name="chevron-forward" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.contactItem}>
            <View style={styles.contactIconContainer}>
              <Icon name="mail-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>{provider.email || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <View style={styles.contactIconContainer}>
              <Icon name="time-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Business Hours</Text>
              <Text style={styles.contactValue}>Mon - Sun: 8:00 AM - 8:00 PM</Text>
            </View>
          </View>
        </GlassCard>

        {/* Reviews Section */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.reviewSummary}>
            <Text style={styles.reviewScore}>{provider.rating}</Text>
            <View style={styles.reviewStars}>
              <View style={styles.starsContainer}>{renderStars(provider.rating)}</View>
              <Text style={styles.reviewCountText}>Based on {provider.reviewCount} reviews</Text>
            </View>
          </View>

          {/* Sample Review */}
          <View style={styles.reviewItem}>
            <View style={styles.reviewerInfo}>
              <View style={styles.reviewerAvatar}>
                <Text style={styles.reviewerInitial}>J</Text>
              </View>
              <View>
                <Text style={styles.reviewerName}>John M.</Text>
                <View style={styles.reviewStars}>{renderStars(5)}</View>
              </View>
            </View>
            <Text style={styles.reviewText}>
              "Excellent service! Very professional and timely. Would definitely recommend."
            </Text>
            <Text style={styles.reviewDate}>2 days ago</Text>
          </View>

          <View style={styles.reviewItem}>
            <View style={styles.reviewerInfo}>
              <View style={styles.reviewerAvatar}>
                <Text style={styles.reviewerInitial}>S</Text>
              </View>
              <View>
                <Text style={styles.reviewerName}>Sarah W.</Text>
                <View style={styles.reviewStars}>{renderStars(4)}</View>
              </View>
            </View>
            <Text style={styles.reviewText}>
              "Good value for money. Fast response and quality work."
            </Text>
            <Text style={styles.reviewDate}>1 week ago</Text>
          </View>
        </GlassCard>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <GlassButton
          title="Contact Provider"
          variant="primary"
          onPress={handleCall}
          style={styles.contactButton}
        />
        <TouchableOpacity style={styles.favoriteButton}>
          <Icon name="heart-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl + 10,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  categoryBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  providerName: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  reviewText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  openStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${theme.colors.success}20`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openText: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '600',
  },
  closedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${theme.colors.error}20`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  closedText: {
    fontSize: 12,
    color: theme.colors.error,
    fontWeight: '600',
  },
  priceBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
  },
  sectionCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
  readMoreText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
    fontWeight: '500',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  locationText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    flex: 1,
  },
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  distanceText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
  },
  mapContainer: {
    marginTop: theme.spacing.sm,
    borderRadius: theme.glassStyle.borderRadius,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: 200,
  },
  mapMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.glassStyle.borderRadius,
    marginTop: theme.spacing.sm,
  },
  viewMapText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  contactIconContainer: {
    width: 40,
    marginRight: theme.spacing.md,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  viewAllText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  reviewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  reviewScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.warning,
  },
  reviewStars: {
    gap: 4,
  },
  reviewCountText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
  },
  reviewItem: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  reviewerName: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  reviewDate: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  bottomSpacing: {
    height: 80,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  contactButton: {
    flex: 1,
  },
  favoriteButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProviderDetailScreen;