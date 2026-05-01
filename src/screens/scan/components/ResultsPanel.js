// src/screens/scan/components/ResultsPanel.js
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProviderCard from './ProviderCard';

const { width, height } = Dimensions.get('window');

const ResultsPanel = ({
  scanState,
  activeCategory,
  providers,
  selectedProvider,
  onSelectProvider,
  onClearScan,
  isSheetCollapsed,
  onToggleCollapse,
  sheetAnim,
}) => {
  const insets = useSafeAreaInsets();

  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [height * 0.85, height * 0.65, 0]
  });

  return (
    <Animated.View
      style={[
        styles.sheet,
        {
          paddingBottom: insets.bottom + 10,
          transform: [{ translateY: sheetTranslateY }],
          maxHeight: isSheetCollapsed ? height * 0.2 : height * 0.52,
        },
      ]}
    >
      <TouchableOpacity onPress={onToggleCollapse} activeOpacity={0.7}>
        <View style={styles.sheetHandle} />
      </TouchableOpacity>

      <View style={styles.sheetTop}>
        <View style={styles.sheetLeft}>
          {activeCategory && (
            <View style={[styles.catBadge, { backgroundColor: activeCategory.color + '1a' }]}>
              <Icon name={activeCategory.icon} size={10} color={activeCategory.color} />
              <Text style={[styles.catBadgeText, { color: activeCategory.color }]}>
                {activeCategory.label}
              </Text>
            </View>
          )}
          <Text style={styles.sheetTitle}>
            {scanState === 'scanning' ? 'Scanning area...' : 'Best Matches'}
          </Text>
        </View>

        {scanState === 'results' && !isSheetCollapsed && (
          <View style={styles.sheetRight}>
            <Text style={styles.sheetCount}>{providers.length} found</Text>
            <TouchableOpacity onPress={onClearScan} style={styles.sheetClose}>
              <Icon name="times" size={12} color="rgba(255,255,255,0.38)" />
            </TouchableOpacity>
          </View>
        )}

        {scanState === 'results' && isSheetCollapsed && (
          <TouchableOpacity onPress={onToggleCollapse} style={styles.expandBtn}>
            <Icon name="chevron-up" size={12} color="rgba(255,255,255,0.5)" />
            <Text style={styles.expandText}>Expand</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isSheetCollapsed && (
        <>
          {scanState === 'scanning' ? (
            <View style={styles.skeletonWrap}>
              <View style={styles.scanningRow}>
                <ActivityIndicator size="small" color={activeCategory?.color ?? '#22C55E'} />
                <Text style={[styles.scanningText, { color: activeCategory?.color ?? '#22C55E' }]}>
                  Locating services near you
                </Text>
              </View>
              {[0, 1, 2].map(i => (
                <View key={i} style={[styles.skeleton, { opacity: 0.055 - i * 0.013 }]} />
              ))}
            </View>
          ) : (
            <FlatList
              data={providers}
              keyExtractor={i => i.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listPad}
              renderItem={({ item }) => (
                <ProviderCard
                  item={item}
                  selected={selectedProvider?.id === item.id}
                  onPress={onSelectProvider}
                />
              )}
            />
          )}
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(9,9,11,0.97)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    zIndex: 30,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sheetLeft: { gap: 4 },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  sheetRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sheetCount: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  sheetClose: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  expandText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  skeletonWrap: {
    padding: 16,
    gap: 10,
  },
  scanningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 6,
  },
  scanningText: {
    fontSize: 13,
    fontWeight: '500',
  },
  skeleton: {
    height: 62,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  listPad: {
    padding: 12,
    gap: 8,
    paddingBottom: 20,
  },
});

export default ResultsPanel;