// src/screens/provider/EditProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import theme from '../../utils/theme';

const CATEGORIES = ['Fundi', 'Food', 'Bodaboda', 'Salon', 'Tutor', 'Delivery', 'Health'];

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { providerProfile } = useAuth();

  const [businessName, setBusinessName] = useState(providerProfile?.businessName || '');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Fundi');
  const [isActive, setIsActive] = useState(providerProfile?.isActive ?? true);
  const [radiusKm, setRadiusKm] = useState('5');

  const handleSave = () => {
    Alert.alert('Saved', 'Profile updates will be applied (backend integration pending).');
  };

  const Field = ({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textDim}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
          <Ionicons name="checkmark" size={15} color="#fff" />
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar / Business Identity */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(businessName?.charAt(0) || 'B').toUpperCase()}
            </Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.avatarName}>{businessName || 'Your Business'}</Text>
            <View style={[
              styles.verifiedBadge,
              { backgroundColor: providerProfile?.isVerified ? 'rgba(34,197,94,0.12)' : theme.colors.primarySurface }
            ]}>
              <Ionicons
                name={providerProfile?.isVerified ? 'shield-checkmark' : 'shield-outline'}
                size={11}
                color={providerProfile?.isVerified ? theme.colors.success : theme.colors.primary}
              />
              <Text style={[
                styles.verifiedText,
                { color: providerProfile?.isVerified ? theme.colors.success : theme.colors.primary }
              ]}>
                {providerProfile?.isVerified ? 'Verified' : 'Not Verified'}
              </Text>
            </View>
          </View>
        </View>

        {/* Active Toggle */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[styles.toggleIcon, { backgroundColor: isActive ? 'rgba(34,197,94,0.12)' : theme.colors.surface }]}>
                <Ionicons
                  name={isActive ? 'radio' : 'radio-outline'}
                  size={16}
                  color={isActive ? theme.colors.success : theme.colors.textMuted}
                />
              </View>
              <View>
                <Text style={styles.toggleTitle}>Discoverable</Text>
                <Text style={styles.toggleSub}>
                  {isActive ? 'You appear in scans' : 'Hidden from scans'}
                </Text>
              </View>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: theme.colors.border, true: 'rgba(34,197,94,0.4)' }}
              thumbColor={isActive ? theme.colors.success : theme.colors.textMuted}
            />
          </View>
        </View>

        {/* Business Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Business Info</Text>
          <Field
            label="Business Name"
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="e.g. James Boda Service"
          />
          <Field
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="+254 7XX XXX XXX"
            keyboardType="phone-pad"
          />
          <Field
            label="WhatsApp"
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder="+254 7XX XXX XXX"
            keyboardType="phone-pad"
          />
          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Tell customers what you offer..."
            multiline
          />
        </View>

        {/* Category */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.catChip, category === c && styles.catChipActive]}
                onPress={() => setCategory(c)}
                activeOpacity={0.75}
              >
                <Text style={[styles.catChipText, category === c && styles.catChipTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Service Radius */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Radius</Text>
          <View style={styles.radiusRow}>
            <TouchableOpacity
              style={styles.radiusBtn}
              onPress={() => setRadiusKm(prev => String(Math.max(1, Number(prev) - 1)))}
            >
              <Ionicons name="remove" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
            <View style={styles.radiusDisplay}>
              <Text style={styles.radiusValue}>{radiusKm}</Text>
              <Text style={styles.radiusUnit}>km</Text>
            </View>
            <TouchableOpacity
              style={styles.radiusBtn}
              onPress={() => setRadiusKm(prev => String(Math.min(50, Number(prev) + 1)))}
            >
              <Ionicons name="add" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.radiusHint}>
            Customers within {radiusKm}km can discover your business
          </Text>
        </View>

        {/* Danger Zone */}
        <View style={[styles.card, styles.dangerCard]}>
          <Text style={styles.cardTitle}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.dangerBtn}
            onPress={() => Alert.alert('Delete Account', 'This will permanently remove your provider profile. (Backend integration pending)')}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={15} color={theme.colors.error} />
            <Text style={styles.dangerBtnText}>Delete Provider Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '800',
    color: theme.colors.text,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveBtnText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
    color: '#fff',
  },
  scroll: {
    padding: theme.spacing.lg,
    gap: 14,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primarySurface,
    borderWidth: 2,
    borderColor: theme.colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  avatarInfo: {
    gap: 6,
  },
  avatarName: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  cardTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  toggleSub: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  fieldInput: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
  },
  fieldInputMulti: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  catChipActive: {
    backgroundColor: theme.colors.primarySurface,
    borderColor: theme.colors.primaryBorder,
  },
  catChipText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  catChipTextActive: {
    color: theme.colors.primary,
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  radiusBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primarySurface,
    borderWidth: 1,
    borderColor: theme.colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  radiusValue: {
    fontSize: theme.fontSizes.xxxl,
    fontWeight: '800',
    color: theme.colors.text,
  },
  radiusUnit: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  radiusHint: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textDim,
    textAlign: 'center',
  },
  dangerCard: {
    borderColor: 'rgba(255,32,32,0.15)',
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,32,32,0.2)',
    backgroundColor: 'rgba(255,32,32,0.06)',
  },
  dangerBtnText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.error,
  },
});