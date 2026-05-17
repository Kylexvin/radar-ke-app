// src/navigation/ProviderNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProviderDashboardScreen from '../screens/provider/ProviderDashboardScreen';
import EditProfileScreen from '../screens/provider/EditProfileScreen';
import AnalyticsScreen from '../screens/provider/AnalyticsScreen';

const Stack = createNativeStackNavigator();

export default function ProviderNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={ProviderDashboardScreen} />
      <Stack.Screen name="Profile" component={EditProfileScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
    </Stack.Navigator>
  );
}