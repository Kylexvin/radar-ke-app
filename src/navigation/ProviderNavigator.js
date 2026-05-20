// src/navigation/ProviderNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProviderDashboardScreen from '../screens/provider/ProviderDashboardScreen';
import EditProfileScreen from '../screens/provider/EditProfileScreen';
import AnalyticsScreen from '../screens/provider/AnalyticsScreen';
import ShowcaseScreen from '../screens/provider/ShowcaseScreen';
import OrdersScreen from '../screens/provider/OrdersScreen';
import BookingsScreen from '../screens/provider/BookingsScreen';

const Stack = createNativeStackNavigator();

export default function ProviderNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={ProviderDashboardScreen} />
      <Stack.Screen name="Profile" component={EditProfileScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Showcase" component={ShowcaseScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="Bookings" component={BookingsScreen} />
    </Stack.Navigator>
  );
}