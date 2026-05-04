import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/screens/marketplace/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
import theme from './src/utils/theme';

const NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.background,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.primary,
  },
};

export default function App() {
  const baseURL = Platform.OS === 'ios'
    ? 'http://192.168.100.10:5000'
    : 'http://192.168.100.10:5000';

  axios.defaults.baseURL = baseURL;
  axios.defaults.timeout = 30000;
  axios.defaults.headers.common['Content-Type'] = 'application/json';

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBarStyle('light-content');
      StatusBar.setBackgroundColor(theme.colors.background);
      StatusBar.setTranslucent(false);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <NavigationContainer theme={NavigationTheme}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={theme.colors.background}
            translucent={false}
            hidden={false}
          />
          <AuthProvider>
            <CartProvider>
              <AppNavigator />
            </CartProvider>
          </AuthProvider>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}