// src/components/common/GlassCard.js
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import theme from '../../utils/theme';

const GlassCard = ({ 
  children, 
  intensity = 80, 
  tint = 'dark',
  style,
  ...props 
}) => {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[styles.glassCard, style]}
        {...props}
      >
        {children}
      </BlurView>
    );
  }
  
  // Android fallback
  return (
    <View style={[styles.glassCard, styles.androidFallback, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  glassCard: {
    borderRadius: theme.glassStyle.borderRadius,
    overflow: theme.glassStyle.overflow,
    borderWidth: theme.glassStyle.borderWidth,
    borderColor: theme.colors.border,
  },
  androidFallback: {
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
  },
});

export default GlassCard;