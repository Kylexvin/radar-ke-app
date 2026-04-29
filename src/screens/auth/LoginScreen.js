// src/screens/auth/LoginScreen.js
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

const LoginScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { loginUser, loginProvider } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user'); // 'user' or 'provider'
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const selectedCategory = route.params?.selectedCategory;

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    
    setLoading(true);
    
    let result;
    if (userType === 'user') {
      result = await loginUser(email, password);
    } else {
      result = await loginProvider(email, password);
    }
    
    setLoading(false);
    
    if (result.success) {
      // Login successful - AppNavigator will handle navigation based on userType
      Alert.alert('Success', 'Login successful!');
    } else {
      Alert.alert('Login Failed', result.message);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register', { selectedCategory });
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
      <LoadingOverlay visible={loading} message="Logging in..." />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            {selectedCategory 
              ? `Find the best ${selectedCategory} services near you`
              : 'Sign in to continue'}
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
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <InputField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <GlassButton
            title="Sign In"
            variant="primary"
            onPress={handleLogin}
            style={styles.loginButton}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Sign Up</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
  },
  loginButton: {
    marginBottom: theme.spacing.md,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  registerText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
  },
  registerLink: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
  },
});

export default LoginScreen;