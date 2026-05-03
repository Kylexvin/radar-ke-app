import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import MarketplaceScreen from '../screens/marketplace/MarketplaceScreen';
// import ShopScreen from '../screens/marketplace/ShopScreen';
// import ProductScreen from '../screens/marketplace/ProductScreen';
// import CartScreen from '../screens/marketplace/CartScreen';


const Stack = createNativeStackNavigator();

export default function MarketplaceNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MarketplaceHome" component={MarketplaceScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
    </Stack.Navigator>
  );
} 