// src/screens/scan/constants.js
export const CATEGORIES = [
  { id: 'fundi', label: 'Fundi', color: '#3B82F6', icon: 'wrench', count: 12 },
  { id: 'food', label: 'Food', color: '#F97316', icon: 'cutlery', count: 28 },
  { id: 'bodaboda', label: 'Boda', color: '#EAB308', icon: 'motorcycle', count: 34 },
  { id: 'salon', label: 'Salon', color: '#A855F7', icon: 'scissors', count: 9 },
  { id: 'tutor', label: 'Tutor', color: '#22C55E', icon: 'book', count: 7 },
  { id: 'delivery', label: 'Delivery', color: '#EF4444', icon: 'cube', count: 15 },
  { id: 'health', label: 'Health', color: '#14B8A6', icon: 'stethoscope', count: 6 },
];

export const DUMMY_PROVIDERS = [
  { id: '1', name: 'Kamau Rides', category: 'bodaboda', color: '#EAB308', icon: 'motorcycle', distance: '0.8 km', radiusKm: 2, isActive: true, rating: 4.8, coordinates: { latitude: -1.2880, longitude: 36.8250 } },
  { id: '2', name: 'Swift Boda', category: 'bodaboda', color: '#EAB308', icon: 'motorcycle', distance: '1.4 km', radiusKm: 3, isActive: true, rating: 4.5, coordinates: { latitude: -1.2960, longitude: 36.8300 } },
  { id: '3', name: 'Nairobi Express', category: 'bodaboda', color: '#EAB308', icon: 'motorcycle', distance: '2.1 km', radiusKm: 5, isActive: false, rating: 4.2, coordinates: { latitude: -1.2850, longitude: 36.8180 } },
  { id: '4', name: 'CBD Boda', category: 'bodaboda', color: '#EAB308', icon: 'motorcycle', distance: '2.7 km', radiusKm: 4, isActive: true, rating: 4.6, coordinates: { latitude: -1.2990, longitude: 36.8160 } },
];