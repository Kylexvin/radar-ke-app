// src/components/common/InputField.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import theme from '../../utils/theme';

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isSecure = secureTextEntry && !isPasswordVisible;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const InputComponent = Platform.OS === 'ios' ? BlurView : View;
  const inputProps = Platform.OS === 'ios' 
    ? { intensity: 80, tint: 'dark' }
    : {};

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <InputComponent
        style={[styles.inputContainer, error && styles.inputError]}
        {...inputProps}
      >
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={isSecure}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.eyeButton}
          >
            <Text style={styles.eyeText}>
              {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}
      </InputComponent>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.glassStyle.borderRadius,
    borderWidth: theme.glassStyle.borderWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    minHeight: 48,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  multilineInput: {
    paddingTop: theme.spacing.md,
    minHeight: 100,
  },
  inputError: {
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.sm,
    marginTop: theme.spacing.xs,
  },
  eyeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  eyeText: {
    fontSize: 18,
    opacity: 0.7,
  },
});

export default InputField;