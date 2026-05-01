// src/screens/scan/ScanResultsScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import CategoryChip from '../../components/common/CategoryChip';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import theme from '../../utils/theme';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const SNAP_INTERVAL = CARD_WIDTH + 12;

// Dummy scan results data (same as before)
const dummyScanResults = {
  'fundi': [
    {
      id: '1',
      name: 'John\'s Auto Repair',
      category: 'fundi',
      rating: 4.8,
      reviewCount: 127,
      distance: 0.3,
      address: 'Kilimani, Nairobi',
      phone: '+254 712 345 678',
      isOpen: true,
      priceLevel: '$$',
      imageUrl: null,
      description: 'Professional auto repair and maintenance services. Specializing in all car brands.',
    },
    {
      id: '2',
      name: 'Quick Fix Electronics',
      category: 'fundi',
      rating: 4.6,
      reviewCount: 89,
      distance: 0.7,
      address: 'Hurlingham, Nairobi',
      phone: '+254 723 456 789',
      isOpen: true,
      priceLevel: '$$',
      imageUrl: null,
      description: 'Phone, laptop, and electronics repair with warranty.',
    },
    {
      id: '3',
      name: 'Home Repairs Pro',
      category: 'fundi',
      rating: 4.9,
      reviewCount: 203,
      distance: 1.2,
      address: 'Lavington, Nairobi',
      phone: '+254 734 567 890',
      isOpen: false,
      priceLevel: '$$$',
      imageUrl: null,
      description: 'Plumbing, electrical, and general home repairs.',
    },
  ],
  'food': [
    {
      id: '4',
      name: 'Taste of Kenya Restaurant',
      category: 'food',
      rating: 4.5,
      reviewCount: 342,
      distance: 0.5,
      address: 'Hurlingham, Nairobi',
      phone: '+254 745 678 901',
      isOpen: true,
      priceLevel: '$$',
      imageUrl: null,
      description: 'Authentic Kenyan cuisine. Open for breakfast, lunch, and dinner.',
    },
    {
      id: '5',
      name: 'Pizza Heaven',
      category: 'food',
      rating: 4.7,
      reviewCount: 178,
      distance: 0.9,
      address: 'Kilimani, Nairobi',
      phone: '+254 756 789 012',
      isOpen: true,
      priceLevel: '$$',
      imageUrl: null,
      description: 'Best pizzas in town. Delivery available.',
    },
  ],
  'bodaboda': [
    {
      id: '6',
      name: 'SafeRide Boda',
      category: 'bodaboda',
      rating: 4.9,
      reviewCount: 456,
      distance: 0.2,
      address: 'CBD, Nairobi',
      phone: '+254 767 890 123',
      isOpen: true,
      priceLevel: '$',
      imageUrl: null,
      description: 'Fast and safe boda boda services. Helmet provided.',
    },
  ],
  'salon': [
    {
      id: '7',
      name: 'Glow Beauty Salon',
      category: 'salon',
      rating: 4.7,
      reviewCount: 234,
      distance: 0.8,
      address: 'Westlands, Nairobi',
      phone: '+254 778 901 234',
      isOpen: false,
      priceLevel: '$$$',
      imageUrl: null,
      description: 'Hair, nails, and spa treatments.',
    },
  ],
  'tutor': [
    {
      id: '8',
      name: 'Smart Tutors',
      category: 'tutor',
      rating: 4.6,
      reviewCount: 67,
      distance: 1.2,
      address: 'Lavington, Nairobi',
      phone: '+254 789 012 345',
      isOpen: true,
      priceLevel: '$$',
      imageUrl: null,
      description: 'Qualified tutors for all subjects. Online and in-person.',
    },
  ],
  'delivery': [
    {
      id: '9',
      name: 'QuickDeliver',
      category: 'delivery',
      rating: 4.4,
      reviewCount: 512,
      distance: 0.6,
      address: 'Kilimani, Nairobi',
      phone: '+254 790 123 456',
      isOpen: true,
      priceLevel: '$',
      imageUrl: null,
      description: 'Fast delivery for food, packages, and more.',
    },
  ],
  'health': [
    {
      id: '10',
      name: 'Afya Medical Center',
      category: 'health',
      rating: 4.9,
      reviewCount: 189,
      distance: 1.0,
      address: 'Upper Hill, Nairobi',
      phone: '+254 701 234 567',
      isOpen: true,
      priceLevel: '$$$',
      imageUrl: null,
      description: '24/7 medical services. Walk-ins welcome.',
    },
  ],
};

const categories = [
  { id: 'fundi', label: 'Fundi', color: theme.colors.fundi, icon: 'construct-outline' },
  { id: 'food', label: 'Food', color: theme.colors.food, icon: 'restaurant-outline' },
  { id: 'bodaboda', label: 'Boda Boda', color: theme.colors.bodaboda, icon: 'bicycle-outline' },
  { id: 'salon', label: 'Salon', color: theme.colors.salon, icon: 'cut-outline' },
  { id: 'tutor', label: 'Tutor', color: theme.colors.tutor, icon: 'school-outline' },
  { id: 'delivery', label: 'Delivery', color: theme.colors.delivery, icon: 'cube-outline' },
  { id: 'health', label: 'Health', color: theme.colors.health, icon: 'medkit-outline' },
];

const ScanResultsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedCategory, scanRadius } = route.params || { selectedCategory: 'fundi', scanRadius: 5 };
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState(selectedCategory);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const flatListRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadResults();
  }, [activeCategory]);

  const loadResults = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const categoryResults = dummyScanResults[activeCategory] || dummyScanResults.fundi;
      setResults(categoryResults);
      setSelectedProvider(null);
      setCurrentIndex(0);
      setLoading(false);
    }, 1000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadResults();
    setRefreshing(false);
  };

  const handleCategoryPress = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleProviderPress = (provider) => {
    navigation.navigate('ProviderDetail', { provider });
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: slideAnim } } }],
    { useNativeDriver: true }
  );

  const onMomentumScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    setCurrentIndex(index);
    setSelectedProvider(results[index]);
  };

  const scrollToIndex = (index) => {
    flatListRef.current?.scrollToOffset({
      offset: index * SNAP_INTERVAL,
      animated: true,
    });
    setCurrentIndex(index);
    setSelectedProvider(results[index]);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} name="star" size={14} color={theme.colors.warning} />);
    }
    if (hasHalfStar) {
      stars.push(<Icon key="half" name="star-half" size={14} color={theme.colors.warning} />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Icon key={`empty-${i}`} name="star-outline" size={14} color={theme.colors.warning} />);
    }
    return stars;
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories[0];
  };

  const renderResultCard = ({ item, index }) => {
    const categoryInfo = getCategoryInfo(item.category);
    const isSelected = selectedProvider?.id === item.id;
    
    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleProviderPress(item)}
        >
          <GlassCard style={[styles.resultCard, isSelected && styles.selectedCard]}>
            <View style={styles.cardHeader}>
              <View style={[styles.categoryIcon, { backgroundColor: `${categoryInfo.color}20` }]}>
                <Icon name={categoryInfo.icon} size={24} color={categoryInfo.color} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.providerName}>{item.name}</Text>
                <View style={styles.ratingContainer}>
                  {renderStars(item.rating)}
                  <Text style={styles.reviewCount}>({item.reviewCount})</Text>
                </View>
              </View>
              {item.isOpen ? (
                <View style={styles.openBadge}>
                  <Text style={styles.openText}>Open</Text>
                </View>
              ) : (
                <View style={styles.closedBadge}>
                  <Text style={styles.closedText}>Closed</Text>
                </View>
              )}
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.cardFooter}>
              <View style={styles.footerItem}>
                <Icon name="location-outline" size={14} color={theme.colors.textMuted} />
                <Text style={styles.footerText}>{item.distance}km • {item.address}</Text>
              </View>
              <View style={styles.footerItem}>
                <Icon name="cash-outline" size={14} color={theme.colors.textMuted} />
                <Text style={styles.footerText}>{item.priceLevel}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => handleProviderPress(item)}
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
              <Icon name="arrow-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </GlassCard>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="search-outline" size={80} color={theme.colors.textMuted} />
      <Text style={styles.emptyTitle}>No services found</Text>
      <Text style={styles.emptyText}>
        Try adjusting your search radius or select a different category
      </Text>
      <GlassButton
        title="Change Category"
        variant="ghost"
        onPress={() => setActiveCategory('fundi')}
        style={styles.emptyButton}
      />
    </View>
  );

  if (loading) {
    return <LoadingOverlay visible={true} message="Scanning for services..." />;
  }

  const categoryInfo = getCategoryInfo(activeCategory);
  const filteredResults = results;

  return (
    <View style={styles.container}>
      {/* Categories Scroll - Top */}
      <View style={styles.topSection}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Scan Results</Text>
            <Text style={styles.headerSubtitle}>
              {filteredResults.length} {filteredResults.length === 1 ? 'service' : 'services'} found within {scanRadius}km
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              category={category.id}
              label={category.label}
              selected={activeCategory === category.id}
              onPress={() => handleCategoryPress(category.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Map Area Placeholder - This would be your actual map component */}
      <View style={styles.mapArea}>
        <View style={styles.mapPlaceholder}>
          <Icon name="map-outline" size={60} color={theme.colors.textMuted} />
          <Text style={styles.mapPlaceholderText}>Map View</Text>
          <Text style={styles.mapPlaceholderSubtext}>
            Showing {filteredResults.length} results within {scanRadius}km
          </Text>
        </View>
      </View>

      {/* Horizontal Swipeable Cards at Bottom */}
      {filteredResults.length > 0 ? (
        <View style={styles.bottomSheet}>
          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {filteredResults.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => scrollToIndex(index)}
                style={[
                  styles.paginationDot,
                  currentIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          <FlatList
            ref={flatListRef}
            data={filteredResults}
            renderItem={renderResultCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP_INTERVAL}
            decelerationRate="fast"
            contentContainerStyle={styles.cardsList}
            onScroll={onScroll}
            onMomentumScrollEnd={onMomentumScrollEnd}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
              />
            }
          />
        </View>
      ) : (
        <View style={styles.emptyOverlay}>
          {renderEmptyState()}
        </View>
      )}

      {/* Rescan Button */}
      <TouchableOpacity
        style={styles.rescanButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="scan-outline" size={20} color={theme.colors.text} />
        <Text style={styles.rescanText}>Adjust Scan Area</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topSection: {
    backgroundColor: theme.colors.background,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.xl + 10,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  categoriesScroll: {
    maxHeight: 50,
    marginBottom: theme.spacing.md,
  },
  categoriesContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  mapArea: {
    flex: 1,
    backgroundColor: '#111',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  mapPlaceholderText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  mapPlaceholderSubtext: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: theme.spacing.xl + 10,
    backgroundColor: 'transparent',
    zIndex: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: 8,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: theme.colors.primary,
  },
  cardsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: 12,
  },
  resultCard: {
    padding: theme.spacing.md,
  },
  selectedCard: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reviewCount: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginLeft: 4,
  },
  openBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: `${theme.colors.success}20`,
  },
  openText: {
    fontSize: 11,
    color: theme.colors.success,
    fontWeight: '600',
  },
  closedBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: `${theme.colors.error}20`,
  },
  closedText: {
    fontSize: 11,
    color: theme.colors.error,
    fontWeight: '600',
  },
  description: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 4,
  },
  viewDetailsText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  emptyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  emptyButton: {
    marginTop: theme.spacing.lg,
  },
  rescanButton: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 30,
    gap: 8,
    zIndex: 30,
    ...theme.shadow,
  },
  rescanText: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: theme.fontSizes.sm,
  },
});

export default ScanResultsScreen;