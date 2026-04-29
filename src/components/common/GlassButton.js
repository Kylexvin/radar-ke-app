// src/components/common/GlassButton.js
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import theme from '../../utils/theme';

const GlassButton = ({
  title,
  onPress,
  variant = 'primary', // 'primary' or 'ghost'
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.ghostButton,
        isDisabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : theme.colors.primary} />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary ? styles.primaryText : styles.ghostText,
            isDisabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.glassStyle.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
  primaryText: {
    color: theme.colors.text,
  },
  ghostText: {
    color: theme.colors.primary,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default GlassButton;