// src/components/common/CategoryChip.js
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import theme from '../../utils/theme';

const CategoryChip = ({
  category,
  label,
  selected = false,
  onPress,
  style,
}) => {
  const categoryColor = theme.getCategoryColor(category);
  
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        selected && styles.selectedChip,
        selected && { borderColor: categoryColor },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: categoryColor }]} />
      <Text
        style={[
          styles.label,
          selected && styles.selectedLabel,
          selected && { color: categoryColor },
        ]}
      >
        {label || category.charAt(0).toUpperCase() + category.slice(1)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 50, // Pill shape
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  selectedChip: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1.5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    fontWeight: '500',
  },
  selectedLabel: {
    fontWeight: '600',
  },
});

export default CategoryChip;