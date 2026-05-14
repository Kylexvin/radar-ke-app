// src/screens/scan/components/CategoryChips.js
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../../utils/theme';

const { colors } = theme;

const CategoryChip = ({ item, onPress, index }) => {
  // Guard against null or invalid item
  if (!item || !item.id) {
    return null;
  }

  const enter = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 320,
      delay: index * 55,
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  const onPressIn = () =>
    Animated.spring(pressScale, { toValue: 0.92, useNativeDriver: true, speed: 40 }).start();
  const onPressOut = () =>
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  const handlePress = () => {
    if (item && item.slug && onPress) {
      onPress(item);
    }
  };

  const chipColor = item.color || '#FFD700';

  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [
          { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
          { scale: pressScale },
        ],
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <View style={[styles.chip, { borderColor: chipColor + '35' }]}>
          <View style={[styles.chipIconBox, { backgroundColor: chipColor + '1a' }]}>
            <Icon name={item.iconName || 'circle'} size={16} color={chipColor} />
          </View>
          <Text style={styles.chipLabel}>{item.name || 'Category'}</Text>
          {item.count > 0 && (
            <View style={[styles.chipCount, { backgroundColor: chipColor + '22' }]}>
              <Text style={[styles.chipCountText, { color: chipColor }]}>{item.count}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CategoryChips = ({ categories, onSelectCategory }) => {
  const insets = useSafeAreaInsets();

  // Filter to only show categories with providers and valid data
  const availableCategories = (categories || []).filter(cat => 
    cat && 
    cat.hasProviders === true && 
    cat.id && 
    cat.slug
  );

  if (availableCategories.length === 0) {
    return (
      <View style={[styles.emptyWrap, { bottom: insets.bottom + 20 }]}>
        <Text style={styles.emptyText}>No services available nearby</Text>
        <Text style={styles.emptySubtext}>Try expanding your search radius</Text>
      </View>
    );
  }

  return (
    <View style={[styles.chipsWrap, { bottom: insets.bottom + 20 }]}>
      <FlatList
        data={availableCategories}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
        renderItem={({ item, index }) => (
          <CategoryChip 
            item={item} 
            onPress={onSelectCategory} 
            index={index} 
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chipsWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 15,
  },
  chipsScroll: {
    paddingHorizontal: 12,
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,10,12,0.9)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 10,
    gap: 7,
  },
  chipIconBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.82)',
    letterSpacing: 0.2,
  },
  chipCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginLeft: 1,
  },
  chipCountText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
emptyWrap: {
  position: 'absolute',
  left: 0,
  right: 0,
  alignItems: 'center',
  paddingVertical: 12,
  backgroundColor: 'rgba(10,10,12,0.9)',
  marginHorizontal: 20,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.primaryBorder,
},
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 4,
  },
});

export default CategoryChips;
