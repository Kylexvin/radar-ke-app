// src/navigation/ScanNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '../screens/scan/MapScreen';
import ScanResultsScreen from '../screens/scan/ScanResultsScreen';
import ProviderDetailScreen from '../screens/scan/ProviderDetailScreen';
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
      <Stack.Screen name="ScanResults" component={ScanResultsScreen} />
      <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
    </Stack.Navigator>
  );
}