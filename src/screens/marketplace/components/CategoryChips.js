// src/screens/marketplace/components/CategoryChips.js
import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

const CATEGORIES = [
  { id: 'all', name: 'All', color: '#22C55E' },
  { id: 'grocery', name: 'Grocery', color: '#22C55E' },
  { id: 'pharmacy', name: 'Pharmacy', color: '#14B8A6' },
  { id: 'electronics', name: 'Electronics', color: '#3B82F6' },
  { id: 'clothing', name: 'Clothing', color: '#A855F7' },
  { id: 'hardware', name: 'Hardware', color: '#FF8C00' },
  { id: 'food', name: 'Food', color: '#F97316' },
];

const CategoryChips = ({ activeCategory, onSelectCategory }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.chip,
            activeCategory === cat.id && styles.chipActive,
            { borderColor: cat.color + '40' },
          ]}
          onPress={() => onSelectCategory(cat.id)}
        >
          <Text
            style={[
              styles.chipText,
              activeCategory === cat.id && styles.chipTextActive,
              { color: cat.color },
            ]}
          >
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    fontWeight: '700',
  },
});

export default CategoryChips;