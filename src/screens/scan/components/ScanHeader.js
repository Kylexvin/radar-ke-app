// src/screens/scan/components/ScanHeader.js
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  const handleStatusTap = () => {
    if (scanState === 'results' && providers.length > 0) {
      // Optional: Show quick stats modal
      console.log('Show results stats');
    }
  };

  const handleLongPressRadius = () => {
    // Optional: Show radius presets
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
        <>
          <Animated.View style={pulseStyle}>
            <Icon name="circle-o" size={12} color="#22C55E" />
          </Animated.View>
          <Text style={styles.statusText}>Scanning...</Text>
        </>
      );
    }

    // Active category (selected but not scanning/results)
    if (activeCategory && scanState !== 'results') {
      return (
        <>
          <Icon name={activeCategory.iconName} size={12} color={activeCategory.color} />
          <Text style={[styles.statusText, { color: activeCategory.color }]}>
            {activeCategory.name}
          </Text>
          <TouchableOpacity 
            onPress={onClear} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="times-circle" size={12} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        </>
      );
    }

    // Results state
    if (scanState === 'results' && activeCategory) {
      return (
        <>
          <Icon name={activeCategory.iconName} size={12} color={activeCategory.color} />
          <Text style={[styles.statusText, { color: activeCategory.color }]}>
            {activeCategory.name}
          </Text>
          <Animated.Text 
            style={[
              styles.resultCount, 
              { transform: [{ scale: resultBounceAnim }] }
            ]}
          >
            ({providers.length})
          </Animated.Text>
          <TouchableOpacity 
            onPress={onClear} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="times-circle" size={12} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        </>
      );
    }

    // Idle state
    return (
      <>
        <Icon name="hand-pointer-o" size={12} color="rgba(255,255,255,0.4)" />
        <Text style={styles.statusText}>Tap category to scan</Text>
      </>
    );
  };

  const HeaderContent = () => (
    <View style={styles.headerContent}>
      {/* Top Row: Logo + Category Browser Button */}
      <View style={styles.topRow}>
        <View style={styles.logoSection}>
          <Image 
            source={require('../../../../assets/icon.png')} 
            style={styles.logoImage}
          />
          <Text style={styles.logoName}>RADA KE</Text>
        </View>

        <TouchableOpacity 
          style={styles.categoryBrowserBtn}
          onPress={onOpenCategoryBrowser}
          activeOpacity={0.7}
        >
          <Icon name="th-large" size={14} color="#22C55E" />
          <Text style={styles.categoryBrowserText}>
            All ({categories.length})
          </Text>
          <Icon name="angle-right" size={12} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      </View>

      {/* Status Row */}
      <View style={styles.statusRow}>
        <TouchableOpacity 
          style={styles.statusChip} 
          onPress={handleStatusTap}
          activeOpacity={0.7}
          disabled={scanState !== 'results'}
        >
          {renderStatusContent()}
        </TouchableOpacity>
      </View>

      {/* Bottom Row: Radius Control (always visible) */}
      <View style={styles.radiusSection}>
        <Text style={styles.radiusLabel}>Scanning radius:</Text>
        <View style={styles.radiusControls}>
          <TouchableOpacity 
            onPress={onRadiusDown} 
            style={styles.radiusButton}
            activeOpacity={0.7}
          >
            <Icon name="minus" size={12} color="#22C55E" />
          </TouchableOpacity>
          <TouchableOpacity onLongPress={handleLongPressRadius}>
            <Text style={styles.radiusValue}>{searchRadius}km</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onRadiusUp} 
            style={styles.radiusButton}
            activeOpacity={0.7}
          >
            <Icon name="plus" size={12} color="#22C55E" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View 
      style={[styles.headerWrap, { paddingTop: insets.top + 4 }]} 
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
    borderColor: 'rgba(34,197,94,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoImage: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  logoName: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.3,
  },
  categoryBrowserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(34,197,94,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
  },
  categoryBrowserText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
  },
  statusRow: {
    marginTop: 2,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  resultCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22C55E',
    marginLeft: 2,
  },
  radiusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  radiusLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
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
    backgroundColor: 'rgba(34,197,94,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#22C55E',
    minWidth: 45,
    textAlign: 'center',
  },
});

export default ScanHeader;