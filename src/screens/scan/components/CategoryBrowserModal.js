// src/screens/scan/components/CategoryBrowserModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  Platform,
  Animated,
} from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const CategoryBrowserModal = ({ 
  visible, 
  categories, 
  onClose, 
  onSelectCategory,
  userCoords,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentCategories, setRecentCategories] = useState([]);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // Load recent categories from storage
      loadRecentCategories();
    } else {
      fadeAnim.setValue(0);
      setSearchQuery('');
    }
  }, [visible]);

  const loadRecentCategories = () => {
    // You can implement AsyncStorage to load recent categories
    // For now, just show first 3 as example
    const recent = categories.slice(0, 3);
    setRecentCategories(recent);
  };

  const saveRecentCategory = (category) => {
    // Save to AsyncStorage for future sessions
    console.log('Save recent category:', category.name);
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCategory = ({ item, index }) => (
    <Animated.View
      style={[
        styles.categoryItem,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.categoryTouchable}
        onPress={() => {
          saveRecentCategory(item);
          onSelectCategory(item);
          onClose();
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.categoryIcon, { backgroundColor: `${item.color}15` }]}>
          <Icon name={item.iconName} size={24} color={item.color} />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <View style={styles.categoryStats}>
            {item.count !== undefined && (
              <Text style={styles.categoryCount}>
                {item.count} provider{item.count !== 1 ? 's' : ''} nearby
              </Text>
            )}
            {item.distance && (
              <Text style={styles.categoryDistance}>{item.distance}</Text>
            )}
          </View>
        </View>
        <Icon name="chevron-right" size={16} color="rgba(255,255,255,0.3)" />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderRecentSection = () => {
    if (recentCategories.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recently Used</Text>
        <FlatList
          data={recentCategories}
          renderItem={renderCategory}
          keyExtractor={item => `recent-${item.id}`}
          scrollEnabled={false}
        />
      </View>
    );
  };

  const renderAllSection = () => {
    if (filteredCategories.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="search" size={48} color="rgba(255,255,255,0.2)" />
          <Text style={styles.emptyStateText}>No categories found</Text>
          <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          All Categories {filteredCategories.length !== categories.length && `(${filteredCategories.length})`}
        </Text>
        <FlatList
          data={filteredCategories}
          renderItem={renderCategory}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
    >
      <SafeAreaView style={styles.modalContainer}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 80 : 100}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Icon name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Browse Categories</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={18} color="rgba(255,255,255,0.4)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search categories..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="times-circle" size={16} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories List */}
        <FlatList
          data={searchQuery.length > 0 ? filteredCategories : []}
          ListHeaderComponent={
            searchQuery.length === 0 ? (
              <>
                {renderRecentSection()}
                {renderAllSection()}
              </>
            ) : null
          }
          renderItem={renderCategory}
          keyExtractor={(item, index) => `${searchQuery}-${item.id}-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    padding: 0,
  },
  listContainer: {
    paddingBottom: 40,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  categoryItem: {
    marginBottom: 8,
  },
  categoryTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryCount: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },
  categoryDistance: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
  },
});

export default CategoryBrowserModal;