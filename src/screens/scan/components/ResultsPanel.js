// src/screens/scan/components/ResultsPanel.js
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProviderCard from './ProviderCard';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 48;
const SNAP_INTERVAL = CARD_WIDTH + 12;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const ResultsPanel = ({
  scanState,
  activeCategory,
  providers,
  selectedProvider,
  onSelectProvider,
  onClearScan,
  isSheetCollapsed,
  onToggleCollapse,
  sheetAnim,
  navigation,         // passed from MapScreen
}) => {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollAnim = useRef(new Animated.Value(0)).current;

  const catColor = activeCategory?.color ?? '#22C55E';

  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [height * 0.85, height * 0.65, 0],
  });

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollAnim } } }],
    { useNativeDriver: true }
  );

  const onMomentumScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    setCurrentIndex(index);
    if (providers[index]) {
      onSelectProvider(providers[index]);
    }
  };

  const scrollToIndex = (index) => {
    flatListRef.current?.scrollToOffset({ offset: index * SNAP_INTERVAL, animated: true });
    setCurrentIndex(index);
    onSelectProvider(providers[index]);
  };

  const handleNavigateToProvider = (provider) => {
    // Select on map first, then navigate
    onSelectProvider(provider);
    navigation?.navigate('ProviderDetail', { provider });
  };

const renderHorizontalCard = ({ item }) => (
  <View style={styles.cardWrapper}>
    <ProviderCard
      item={item}
      selected={selectedProvider?.id === item.id}
      onPress={onSelectProvider}
      onNavigate={(provider) => {
        // Navigate to detail screen
        navigation.navigate('ProviderDetail', { provider });
      }}
    />
  </View>
);

  const renderDot = (_, index) => (
    <TouchableOpacity
      key={index}
      onPress={() => scrollToIndex(index)}
      style={[
        styles.paginationDot,
        currentIndex === index && [styles.paginationDotActive, { backgroundColor: catColor }],
      ]}
    />
  );

  return (
    <Animated.View
      style={[
        styles.sheet,
        {
          paddingBottom: insets.bottom + 10,
          transform: [{ translateY: sheetTranslateY }],
          maxHeight: isSheetCollapsed ? height * 0.2 : height * 0.45,
        },
      ]}
    >
      {/* Handle */}
      <TouchableOpacity onPress={onToggleCollapse} activeOpacity={0.7} style={styles.handleArea}>
        <View style={[styles.sheetHandle, isSheetCollapsed && { backgroundColor: catColor + '60' }]} />
      </TouchableOpacity>

      <View style={styles.sheetTop}>
        <View style={styles.sheetLeft}>
          {activeCategory && (
            <View style={[styles.catBadge, { backgroundColor: catColor + '1a' }]}>
              <Icon name={activeCategory.icon} size={10} color={catColor} />
              <Text style={[styles.catBadgeText, { color: catColor }]}>
                {activeCategory.label}
              </Text>
            </View>
          )}
          <Text style={styles.sheetTitle}>
            {scanState === 'scanning' ? 'Scanning area...' : 'Best Matches'}
          </Text>
        </View>

        {scanState === 'results' && !isSheetCollapsed && (
          <View style={styles.sheetRight}>
            <View style={[styles.countPill, { backgroundColor: catColor + '18', borderColor: catColor + '30' }]}>
              <Text style={[styles.sheetCount, { color: catColor }]}>
                {providers.length} found
              </Text>
            </View>
            <TouchableOpacity onPress={onClearScan} style={styles.sheetClose}>
              <Icon name="times" size={12} color="rgba(255,255,255,0.38)" />
            </TouchableOpacity>
          </View>
        )}

        {scanState === 'results' && isSheetCollapsed && (
          <TouchableOpacity onPress={onToggleCollapse} style={styles.expandBtn}>
            <Icon name="chevron-up" size={12} color="rgba(255,255,255,0.5)" />
            <Text style={styles.expandText}>Expand</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isSheetCollapsed && (
        <>
          {scanState === 'scanning' ? (
            <View style={styles.skeletonWrap}>
              <View style={styles.scanningRow}>
                <ActivityIndicator size="small" color={catColor} />
                <Text style={[styles.scanningText, { color: catColor }]}>
                  Locating services near you
                </Text>
              </View>
              {[0, 1, 2].map(i => (
                <View key={i} style={[styles.skeleton, { opacity: 0.055 - i * 0.013 }]} />
              ))}
            </View>
          ) : providers.length > 0 ? (
            <>
              <AnimatedFlatList
                ref={flatListRef}
                data={providers}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                contentContainerStyle={styles.horizontalList}
                renderItem={renderHorizontalCard}
                onScroll={onScroll}
                onMomentumScrollEnd={onMomentumScrollEnd}
                scrollEventThrottle={16}
              />
              <View style={styles.paginationContainer}>
                {providers.map(renderDot)}
              </View>
            </>
          ) : (
            <View style={styles.emptyResults}>
              <View style={[styles.emptyIconWrap, { borderColor: catColor + '25' }]}>
                <Icon name="search" size={22} color={catColor + '60'} />
              </View>
              <Text style={styles.emptyTitle}>No {activeCategory?.label ?? 'services'} nearby</Text>
              <Text style={styles.emptySubtext}>Try increasing your search radius or a different area</Text>
              <TouchableOpacity onPress={onClearScan} style={[styles.emptyBtn, { borderColor: catColor + '40' }]}>
                <Text style={[styles.emptyBtnText, { color: catColor }]}>Change category</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(9,9,11,0.97)',
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    zIndex: 30,
  },
  handleArea: { paddingVertical: 10, alignItems: 'center' },
  sheetHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
  sheetTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  sheetLeft: { gap: 4 },
  catBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start',
  },
  catBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  sheetRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  countPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  sheetCount: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  sheetClose: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },
  expandBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16,
  },
  expandText: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  skeletonWrap: { padding: 16, gap: 10 },
  scanningRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 6 },
  scanningText: { fontSize: 13, fontWeight: '500' },
  skeleton: {
    height: 62, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  horizontalList: { paddingHorizontal: 16, paddingVertical: 8, gap: 12 },
  cardWrapper: { width: CARD_WIDTH, marginRight: 12 },
  paginationContainer: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', paddingVertical: 12, gap: 8,
  },
  paginationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  paginationDotActive: { width: 20, borderRadius: 3 },
  emptyResults: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, paddingHorizontal: 24, gap: 10 },
  emptyIconWrap: { width: 56, height: 56, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  emptySubtext: { fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 18 },
  emptyBtn: { marginTop: 6, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  emptyBtnText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
});

export default ResultsPanel;