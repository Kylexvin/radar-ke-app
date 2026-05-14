// src/screens/scan/components/ScanHeader.js
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,Image,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../../utils/theme';

const { colors } = theme;

const ScanHeader = ({
  scanState,
  activeCategory,
  searchRadius,
  onRadiusUp,
  onRadiusDown,
  onClear,
  providers = [],
  categories = [],
  onOpenCategoryBrowser,
}) => {
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const resultBounceAnim = useRef(new Animated.Value(0)).current;

  // Pulsing animation for scanning state
  useEffect(() => {
    if (scanState === 'scanning') {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => pulse());
      };
      pulse();
    } else {
      pulseAnim.setValue(0);
    }
  }, [scanState]);

  // Bounce animation for results count
  useEffect(() => {
    if (scanState === 'results' && providers.length > 0) {
      Animated.sequence([
        Animated.timing(resultBounceAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(resultBounceAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [providers.length, scanState]);

  const handleLongPressRadius = () => {
    console.log('Show radius presets');
  };

  const renderStatusContent = () => {
    // Scanning state
    if (scanState === 'scanning') {
      const pulseStyle = {
        opacity: pulseAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.3, 1, 0.3],
        }),
        transform: [
          {
            scale: pulseAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.8, 1.1, 0.8],
            }),
          },
        ],
      };

      return (
        <View style={styles.statusBadge}>
          <Animated.View style={pulseStyle}>
            <Icon name="circle-o" size={12} color={colors.primary} />
          </Animated.View>
          <Text style={styles.statusText}>Scanning {activeCategory?.name}...</Text>
        </View>
      );
    }

    // Results state
    if (scanState === 'results' && activeCategory) {
      return (
        <View style={styles.statusBadge}>
          <Icon name={activeCategory.iconName} size={12} color={activeCategory.color} />
          <Text style={[styles.statusText, { color: activeCategory.color }]}>
            {activeCategory.name}
          </Text>
          <Animated.Text
            style={[
              styles.resultCount,
              { transform: [{ scale: resultBounceAnim }] },
            ]}
          >
            {providers.length}
          </Animated.Text>
          <TouchableOpacity
            onPress={onClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.clearBtn}
          >
            <Icon name="times" size={12} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      );
    }

    // Idle state
    return null;
  };

  const HeaderContent = () => (
    <View style={styles.headerContent}>
      {/* Top Row: Logo + Category Browser Button */}
      <View style={styles.topRow}>
       <View style={styles.logoSection}>
  <View style={styles.logoImageWrap}>
    <Image
      source={require('../../../../assets/icon.png')}
      style={styles.logoImage}
      resizeMode="contain"
    />
  </View>
  <Text style={styles.logoName}>
    RADA <Text style={styles.logoKe}>KE</Text>
  </Text>
</View>

        <TouchableOpacity
          style={styles.categoryBrowserBtn}
          onPress={onOpenCategoryBrowser}
          activeOpacity={0.7}
        >
          <Icon name="th-large" size={14} color={colors.primary} />
          <Text style={styles.categoryBrowserText}>
            All ({categories.length})
          </Text>
          <Icon name="angle-right" size={12} color={colors.textDim} />
        </TouchableOpacity>
      </View>

      {/* Bottom Row: Radius Control */}
      <View style={styles.radiusSection}>
        <Text style={styles.radiusLabel}>Scanning radius:</Text>
        <View style={styles.radiusControls}>
          <TouchableOpacity
            onPress={onRadiusDown}
            style={styles.radiusButton}
            activeOpacity={0.7}
          >
            <Icon name="minus" size={12} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onLongPress={handleLongPressRadius}>
            <Text style={styles.radiusValue}>{searchRadius}km</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onRadiusUp}
            style={styles.radiusButton}
            activeOpacity={0.7}
          >
            <Icon name="plus" size={12} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Badge */}
      {renderStatusContent()}
    </View>
  );

  return (
    <View
      style={[styles.headerWrap, { paddingTop: insets.top + 2 }]}
      pointerEvents="box-none"
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={35} tint="dark" style={styles.headerBlur}>
          <HeaderContent />
        </BlurView>
      ) : (
        <View style={[styles.headerBlur, { backgroundColor: 'rgba(9,9,11,0.88)' }]}>
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
    alignItems: 'center',
  },
  headerBlur: {
    width: '94%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // ── Logo
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  logoBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  logoName: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 1.5,
  },
  logoImageWrap: {
  width: 28,
  height: 28,
  borderRadius: 8,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: colors.primaryBorder,
},
logoImage: {
  width: '100%',
  height: '100%',
},
  logoKe: {
    color: colors.primary,
    fontWeight: '800',
  },

  // ── Category browser button
  categoryBrowserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primarySurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  categoryBrowserText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryLight,
  },

  // ── Radius
  radiusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  radiusLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  radiusControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radiusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryLight,
    minWidth: 45,
    textAlign: 'center',
  },

  // ── Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    flex: 1,
  },
  resultCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryLight,
    backgroundColor: colors.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ScanHeader;