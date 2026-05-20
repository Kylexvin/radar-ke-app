// src/screens/provider/BookingsScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../utils/theme';

export default function BookingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bookings Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' },
  text: { color: theme.colors.text, fontSize: 18 },
});