// src/screens/scan/components/ScanHeader.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../../utils/theme';

const ScanHeader = ({
  scanState,
  activeCategory,
  searchRadius,
  showRadiusAdjust,
  onToggleRadius,
  onRadiusUp,
  onRadiusDown,
  onClear,
  headerOpacity,
}) => {
  const insets = useSafeAreaInsets();

  const HeaderContent = () => (
    <View style={styles.headerContent}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>R</Text>
        </View>
        <Text style={styles.logoName}>RADA KE</Text>
      </View>

      {/* Search/Scan Section */}
      <View style={styles.searchSection}>
        <Icon
          name={activeCategory ? activeCategory.icon : 'search'}
          size={14}
          color={activeCategory ? activeCategory.color : 'rgba(255,255,255,0.3)'}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={activeCategory ? `Scanning ${activeCategory.label}...` : "Tap a category to scan..."}
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={activeCategory?.label ?? ''}
          editable={false}
          pointerEvents="none"
        />
        {activeCategory && (
          <TouchableOpacity onPress={onClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="times-circle" size={15} color="rgba(255,255,255,0.28)" />
          </TouchableOpacity>
        )}
      </View>

      {/* Radius Control */}
      <View style={styles.radiusSection}>
        <TouchableOpacity style={styles.radiusBtn} onPress={onToggleRadius} activeOpacity={0.7}>
          <Icon name="dot-circle-o" size={13} color="#22C55E" />
          <Text style={styles.radiusVal}>{searchRadius}km</Text>
          <Icon name={showRadiusAdjust ? 'chevron-up' : 'chevron-down'} size={9} color="rgba(255,255,255,0.28)" />
        </TouchableOpacity>

        {showRadiusAdjust && (
          <View style={styles.radiusAdjuster}>
            <TouchableOpacity onPress={onRadiusDown} style={styles.adjBtn}>
              <Icon name="minus" size={10} color="rgba(255,255,255,0.55)" />
            </TouchableOpacity>
            <Text style={styles.adjVal}>{searchRadius}</Text>
            <TouchableOpacity onPress={onRadiusUp} style={styles.adjBtn}>
              <Icon name="plus" size={10} color="#22C55E" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.headerWrap, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
      {Platform.OS === 'ios' ? (
        <BlurView intensity={20} tint="dark" style={styles.headerBlur}>
          <HeaderContent />
        </BlurView>
      ) : (
        <View style={[styles.headerBlur, { backgroundColor: 'rgba(9,9,11,0.84)' }]}>
          <HeaderContent />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  headerBlur: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  headerContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 8,
  },
  logoCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  logoName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.5,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    padding: 0,
    height: 20,
  },
  radiusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  radiusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  radiusVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#22C55E',
  },
  radiusAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  adjBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjVal: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    minWidth: 30,
    textAlign: 'center',
  },
});

export default ScanHeader;