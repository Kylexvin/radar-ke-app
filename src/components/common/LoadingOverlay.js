// src/components/common/LoadingOverlay.js
import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import theme from '../../utils/theme';

const LoadingOverlay = ({ visible = true, message, intensity = 80 }) => {
  if (!visible) return null;

  const OverlayComponent = Platform.OS === 'ios' ? BlurView : View;
  const overlayProps = Platform.OS === 'ios'
    ? { intensity, tint: 'dark' }
    : {};

  return (
    <OverlayComponent style={styles.overlay} {...overlayProps}>
      <View style={styles.container}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </OverlayComponent>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Platform.OS === 'android' ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Platform.OS === 'android' ? 'rgba(20, 20, 20, 0.95)' : 'transparent',
    borderRadius: theme.glassStyle.borderRadius,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    ...(Platform.OS === 'ios' && {
      backgroundColor: 'rgba(20, 20, 20, 0.85)',
      borderWidth: theme.glassStyle.borderWidth,
      borderColor: theme.colors.border,
    }),
  },
  message: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
});

export default LoadingOverlay;