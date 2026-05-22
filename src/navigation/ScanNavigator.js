// src/navigation/ScanNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '../screens/scan/MapScreen';
import ProviderDetailScreen from '../screens/scan/ProviderDetailScreen';
import ProviderShowcaseScreen from '../screens/scan/ProviderShowcaseScreen';
import theme from '../utils/theme';

const Stack = createNativeStackNavigator();

export default function ScanNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
      <Stack.Screen name="ProviderShowcase" component={ProviderShowcaseScreen} />
    </Stack.Navigator>
  );
}