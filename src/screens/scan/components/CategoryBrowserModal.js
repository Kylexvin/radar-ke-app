// src/screens/scan/components/CategoryBrowserModal.js
import React, { useState, useEffect, useRef } from 'react';
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
  StatusBar,
} from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../../utils/theme';

const { colors } = theme;

const CategoryBrowserModal = ({
  visible,
  categories,
  onClose,
  onSelectCategory,
  userCoords,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentCategories, setRecentCategories] = useState([]);
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(60);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 12, useNativeDriver: true }),
      ]).start();
      setRecentCategories(categories.slice(0, 3));
    } else {
      setSearchQuery('');
    }
  }, [visible]);

  const saveRecentCategory = category => {
    console.log('Save recent:', category.name);
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = item => {
    saveRecentCategory(item);
    onSelectCategory(item);
    onClose();
  };

  // ─── CATEGORY ROW ──────────────────────────────────────────────────────────
  const renderCategory = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        style={styles.categoryRow}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        {/* Icon box */}
        <View style={[styles.catIconBox, { backgroundColor: item.color + '14' }]}>
          <Icon name={item.iconName || 'circle'} size={20} color={item.color} />
        </View>

        {/* Info */}
        <View style={styles.catInfo}>
          <Text style={styles.catName}>{item.name}</Text>
          <View style={styles.catMeta}>
            {item.count > 0 ? (
              <>
                <View style={[styles.countDot, { backgroundColor: item.color }]} />
                <Text style={[styles.catCount, { color: item.color }]}>
                  {item.count} nearby
                </Text>
              </>
            ) : (
              <Text style={styles.catNone}>None nearby</Text>
            )}
          </View>
        </View>

        {/* Right side */}
        <View style={styles.catRight}>
          {item.hasProviders && (
            <View style={[styles.activePill, { borderColor: item.color + '40', backgroundColor: item.color + '12' }]}>
              <Text style={[styles.activePillText, { color: item.color }]}>Active</Text>
            </View>
          )}
          <Icon name="chevron-right" size={12} color={colors.textFaint} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  // ─── SECTION HEADER ────────────────────────────────────────────────────────
  const SectionLabel = ({ label, count }) => (
    <View style={styles.sectionLabel}>
      <Text style={styles.sectionLabelText}>{label}</Text>
      {count !== undefined && (
        <Text style={styles.sectionLabelCount}>{count}</Text>
      )}
    </View>
  );

  const showSearch = searchQuery.length > 0;
  const displayList = showSearch ? filteredCategories : categories;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.root}>

        {/* Background blur on iOS */}
        {Platform.OS === 'ios' && (
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        )}

        {/* ── HEADER */}
        <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? insets.top + 8 : 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose} activeOpacity={0.7}>
            <Icon name="arrow-left" size={16} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Categories</Text>
            <View style={styles.headerPill}>
              <Text style={styles.headerPillText}>{categories.length} total</Text>
            </View>
          </View>

          {/* Spacer to balance back button */}
          <View style={{ width: 36 }} />
        </View>

        {/* ── SEARCH */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Icon name="search" size={13} color={colors.textDim} style={{ marginRight: 9 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search categories..."
              placeholderTextColor={colors.textFaint}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="times-circle" size={14} color={colors.textDim} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── RESULTS COUNT */}
        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>
            {showSearch
              ? `${filteredCategories.length} result${filteredCategories.length !== 1 ? 's' : ''}`
              : `${categories.filter(c => c.hasProviders).length} active near you`}
          </Text>
          <View style={styles.sortBtn}>
            <Icon name="sort" size={11} color={colors.primaryLight} />
            <Text style={styles.sortText}>Active first</Text>
          </View>
        </View>

        {/* ── LIST */}
        <FlatList
          data={displayList}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={renderCategory}
          ListHeaderComponent={
            !showSearch && recentCategories.length > 0 ? (
              <SectionLabel label="Recently Used" />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="search" size={36} color={colors.textFaint} />
              <Text style={styles.emptyTitle}>No categories found</Text>
              <Text style={styles.emptySub}>Try a different search term</Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  headerPill: {
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  headerPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryLight,
  },

  // ── Search
  searchWrap: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    height: 42,
    paddingHorizontal: 13,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },

  // ── Results row
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 11,
    color: colors.textFaint,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  sortText: {
    fontSize: 11,
    color: colors.primaryLight,
  },

  // ── Section label
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 4,
  },
  sectionLabelText: {
    fontSize: 11,
    color: colors.textFaint,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionLabelCount: {
    fontSize: 11,
    color: colors.textFaint,
  },

  // ── List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 8,
  },

  // ── Category row (matches shop card style)
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    padding: 12,
  },
  catIconBox: {
    width: 44,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  catInfo: {
    flex: 1,
    minWidth: 0,
  },
  catName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 3,
  },
  catMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  countDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  catCount: {
    fontSize: 11,
    fontWeight: '500',
  },
  catNone: {
    fontSize: 11,
    color: colors.textFaint,
  },
  catRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // ── Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDim,
    marginTop: 4,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textFaint,
  },
});

export default CategoryBrowserModal;