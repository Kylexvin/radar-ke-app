import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ScanNavigator from './ScanNavigator';
import MarketplaceNavigator from './MarketplaceNavigator';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ProviderNavigator from './ProviderNavigator';
import { useAuth } from '../context/AuthContext';
import theme from '../utils/theme';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { hasProviderProfile } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0e0e0e',
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Scan') {
            iconName = focused ? 'radio' : 'radio-outline';
          } else if (route.name === 'Marketplace') {
            iconName = focused ? 'bag' : 'bag-outline';
          } else if (route.name === 'MyShop') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Scan" component={ScanNavigator} />
      <Tab.Screen name="Marketplace" component={MarketplaceNavigator} />
      {hasProviderProfile && (
        <Tab.Screen
          name="MyShop"
          component={ProviderNavigator}
          options={{ tabBarLabel: 'My Shop' }}
        />
      )}
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}