// src/screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/common/GlassCard';
import InputField from '../../components/common/InputField';
import GlassButton from '../../components/common/GlassButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import theme from '../../utils/theme';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { registerUser, registerProvider } = useAuth();
  
  const [userType, setUserType] = useState('user'); // 'user' or 'provider'
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Provider specific fields
    businessName: '',
    category: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const selectedCategory = route.params?.selectedCategory;

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (userType === 'provider') {
      if (!formData.businessName) newErrors.businessName = 'Business name is required';
      if (!formData.category) newErrors.category = 'Category is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    
    setLoading(true);
    
    let result;
    const userData = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };
    
    if (userType === 'user') {
      result = await registerUser(userData);
    } else {
      const providerData = {
        ...userData,
        businessName: formData.businessName,
        category: selectedCategory || formData.category,
        phone: formData.phone,
      };
      result = await registerProvider(providerData);
    }
    
    setLoading(false);
    
    if (result.success) {
      Alert.alert('Success', 'Registration successful!', [
        { text: 'OK', onPress: () => navigation.replace('Main') }
      ]);
    } else {
      Alert.alert('Registration Failed', result.message);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login', { selectedCategory });
  };

  const toggleUserType = () => {
    setUserType(prev => prev === 'user' ? 'provider' : 'user');
    setErrors({});
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LoadingOverlay visible={loading} message="Creating account..." />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join Rada Ke and find services near you
          </Text>
        </View>

        <GlassCard style={styles.card}>
          {/* User Type Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                userType === 'user' && styles.toggleButtonActive,
              ]}
              onPress={() => setUserType('user')}
            >
              <Text
                style={[
                  styles.toggleText,
                  userType === 'user' && styles.toggleTextActive,
                ]}
              >
                User
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                userType === 'provider' && styles.toggleButtonActive,
              ]}
              onPress={() => setUserType('provider')}
            >
              <Text
                style={[
                  styles.toggleText,
                  userType === 'provider' && styles.toggleTextActive,
                ]}
              >
                Service Provider
              </Text>
            </TouchableOpacity>
          </View>

          <InputField
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(value) => updateForm('name', value)}
            error={errors.name}
          />

          <InputField
            label="Username"
            placeholder="Choose a username"
            value={formData.username}
            onChangeText={(value) => updateForm('username', value)}
            autoCapitalize="none"
            error={errors.username}
          />

          <InputField
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(value) => updateForm('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          {userType === 'provider' && (
            <>
              <InputField
                label="Business Name"
                placeholder="Enter your business name"
                value={formData.businessName}
                onChangeText={(value) => updateForm('businessName', value)}
                error={errors.businessName}
              />

              <InputField
                label="Category"
                placeholder={selectedCategory || "Select category"}
                value={selectedCategory || formData.category}
                onChangeText={(value) => updateForm('category', value)}
                editable={!selectedCategory}
                error={errors.category}
              />

              <InputField
                label="Phone Number"
                placeholder="Enter phone number"
                value={formData.phone}
                onChangeText={(value) => updateForm('phone', value)}
                keyboardType="phone-pad"
                error={errors.phone}
              />
            </>
          )}

          <InputField
            label="Password"
            placeholder="Create a password"
            value={formData.password}
            onChangeText={(value) => updateForm('password', value)}
            secureTextEntry
            error={errors.password}
          />

          <InputField
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateForm('confirmPassword', value)}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <GlassButton
            title="Sign Up"
            variant="primary"
            onPress={handleRegister}
            style={styles.registerButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  card: {
    padding: theme.spacing.lg,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.glassStyle.borderRadius,
    padding: 4,
    marginBottom: theme.spacing.lg,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.glassStyle.borderRadius - 4,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: theme.colors.text,
  },
  registerButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  loginText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
  },
  loginLink: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
  },
});

export default RegisterScreen;