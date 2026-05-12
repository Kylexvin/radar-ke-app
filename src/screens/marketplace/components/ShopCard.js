// src/screens/marketplace/components/ShopCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';

const ShopCard = ({ shop, onPress }) => {
  const getCategoryIcon = (category) => {
    const icons = {
      grocery: 'shopping-basket',
      pharmacy: 'medkit',
      electronics: 'mobile',
      clothing: 'tshirt',
      hardware: 'wrench',
      food: 'cutlery',
    };
    return icons[category] || 'store';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: shop.color + '20' }]}>
          <Icon name={getCategoryIcon(shop.category)} size={24} color={shop.color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{shop.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.rating}>
              <Icon name="star" size={12} color="#FBBF24" />
              <Text style={styles.ratingText}>{shop.rating || '4.5'}</Text>
            </View>
            <Text style={styles.dot}>•</Text>
            <Icon name="map-marker" size={10} color="#666" />
            <Text style={styles.distance}>{shop.distance}km</Text>
            <Text style={styles.dot}>•</Text>
            <View style={[styles.statusDot, { backgroundColor: shop.isOpen ? '#22C55E' : '#EF4444' }]} />
            <Text style={styles.status}>{shop.isOpen ? 'Open' : 'Closed'}</Text>
          </View>
        </View>
        <Icon name="chevron-right" size={16} color="#666" />
      </View>

      {shop.previewProducts && shop.previewProducts.length > 0 && (
        <View style={styles.products}>
          <Text style={styles.productsLabel}>Popular:</Text>
          <Text style={styles.productsList} numberOfLines={1}>
            {shop.previewProducts.map(p => p.name).join(' • ')}
          </Text>
        </View>
      )}

      {shop.deliveryFee !== undefined && (
        <View style={styles.footer}>
          <Icon name="motorcycle" size={12} color="#22C55E" />
          <Text style={styles.deliveryInfo}>
            Delivery: {shop.deliveryFee === 0 ? 'Free' : `KES ${shop.deliveryFee}`}
          </Text>
          {shop.minOrder > 0 && (
            <Text style={styles.minOrder}> • Min order: KES {shop.minOrder}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#FBBF24',
  },
  dot: {
    color: '#444',
    fontSize: 12,
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  status: {
    fontSize: 12,
    color: '#666',
  },
  products: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  productsLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  productsList: {
    flex: 1,
    fontSize: 12,
    color: '#22C55E',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  deliveryInfo: {
    fontSize: 11,
    color: '#22C55E',
  },
  minOrder: {
    fontSize: 11,
    color: '#666',
  },
});

export default ShopCard;