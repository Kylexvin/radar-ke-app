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
import { FontAwesome as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CategoryChip = ({ item, onPress, index }) => {
  const enter = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 320,
      delay: index * 55,
      useNativeDriver: true,
    }).start();
  }, []);

  const onPressIn = () =>
    Animated.spring(pressScale, { toValue: 0.92, useNativeDriver: true, speed: 40 }).start();
  const onPressOut = () =>
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

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
        onPress={() => onPress(item)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <View style={[styles.chip, { borderColor: item.color + '35' }]}>
          <View style={[styles.chipIconBox, { backgroundColor: item.color + '1a' }]}>
            <Icon name={item.icon} size={13} color={item.color} />
          </View>
          <Text style={styles.chipLabel}>{item.label}</Text>
          <View style={[styles.chipCount, { backgroundColor: item.color + '22' }]}>
            <Text style={[styles.chipCountText, { color: item.color }]}>{item.count}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CategoryChips = ({ categories, onSelectCategory }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.chipsWrap, { bottom: insets.bottom + 20 }]}>
      <FlatList
        data={categories}
        keyExtractor={i => i.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
        renderItem={({ item, index }) => (
          <CategoryChip item={item} onPress={onSelectCategory} index={index} />
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
});

export default CategoryChips;