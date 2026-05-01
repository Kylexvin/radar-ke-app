// src/screens/settings/SettingsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Changed to @expo/vector-icons
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import theme from '../../utils/theme';

const SettingsScreen = () => {
  const { user, provider, userType, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, children }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {children}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Section */}
      <GlassCard style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarText}>
              {(user?.name?.charAt(0) || provider?.businessName?.charAt(0) || 'U').toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.name || provider?.businessName || 'User'}
            </Text>
            <Text style={styles.profileEmail}>
              {user?.email || provider?.email || 'user@example.com'}
            </Text>
            <View style={styles.userTypeBadge}>
              <Text style={styles.userTypeText}>
                {userType === 'provider' ? 'Service Provider' : 'Regular User'}
              </Text>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* Preferences Section */}
      <Text style={styles.sectionTitle}>Preferences</Text>
      <GlassCard style={styles.sectionCard}>
        <SettingItem 
          icon="notifications-outline" 
          title="Push Notifications"
          subtitle="Receive alerts about nearby services"
        >
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.text}
          />
        </SettingItem>

        <SettingItem 
          icon="location-outline" 
          title="Location Services"
          subtitle="Allow access to your location"
        >
          <Switch
            value={locationServices}
            onValueChange={setLocationServices}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.text}
          />
        </SettingItem>

        <SettingItem 
          icon="moon-outline" 
          title="Dark Mode"
          subtitle="Always on for Rada Ke"
        >
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            disabled={true}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.text}
          />
        </SettingItem>
      </GlassCard>

      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account</Text>
      <GlassCard style={styles.sectionCard}>
        <TouchableOpacity onPress={() => {}}>
          <SettingItem 
            icon="person-outline" 
            title="Edit Profile"
            subtitle="Update your personal information"
          >
            <Ionicons name="chevron-forward-outline" size={20} color={theme.colors.textMuted} />
          </SettingItem>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}}>
          <SettingItem 
            icon="card-outline" 
            title="Payment Methods"
            subtitle="Manage your payment options"
          >
            <Ionicons name="chevron-forward-outline" size={20} color={theme.colors.textMuted} />
          </SettingItem>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}}>
          <SettingItem 
            icon="shield-checkmark-outline" 
            title="Privacy & Security"
            subtitle="Manage your data and security"
          >
            <Ionicons name="chevron-forward-outline" size={20} color={theme.colors.textMuted} />
          </SettingItem>
        </TouchableOpacity>
      </GlassCard>

      {/* Support Section */}
      <Text style={styles.sectionTitle}>Support</Text>
      <GlassCard style={styles.sectionCard}>
        <TouchableOpacity onPress={() => {}}>
          <SettingItem 
            icon="chatbubble-outline" 
            title="Help Center"
            subtitle="FAQs and support"
          >
            <Ionicons name="chevron-forward-outline" size={20} color={theme.colors.textMuted} />
          </SettingItem>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}}>
          <SettingItem 
            icon="megaphone-outline" 
            title="Report an Issue"
            subtitle="Let us know what's wrong"
          >
            <Ionicons name="chevron-forward-outline" size={20} color={theme.colors.textMuted} />
          </SettingItem>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}}>
          <SettingItem 
            icon="star-outline" 
            title="Rate Us"
            subtitle="Love Rada Ke? Rate us 5 stars"
          >
            <Ionicons name="chevron-forward-outline" size={20} color={theme.colors.textMuted} />
          </SettingItem>
        </TouchableOpacity>
      </GlassCard>

      {/* About Section */}
      <Text style={styles.sectionTitle}>About</Text>
      <GlassCard style={styles.sectionCard}>
        <SettingItem 
          icon="information-circle-outline" 
          title="App Version"
          subtitle="Version 1.0.0"
        />

        <TouchableOpacity onPress={() => {}}>
          <SettingItem 
            icon="document-text-outline" 
            title="Terms of Service"
            subtitle="Read our terms and conditions"
          >
            <Ionicons name="chevron-forward-outline" size={20} color={theme.colors.textMuted} />
          </SettingItem>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}}>
          <SettingItem 
            icon="lock-closed-outline" 
            title="Privacy Policy"
            subtitle="How we handle your data"
          >
            <Ionicons name="chevron-forward-outline" size={20} color={theme.colors.textMuted} />
          </SettingItem>
        </TouchableOpacity>
      </GlassCard>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <GlassButton
          title="Logout"
          variant="ghost"
          onPress={handleLogout}
          style={styles.logoutButton}
          textStyle={styles.logoutText}
        />
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>
        Rada Ke © 2024 - Scan. Find. Connect.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
  },
  profileCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  userTypeBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  userTypeText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingLeft: theme.spacing.xs,
  },
  sectionCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingIcon: {
    width: 40,
    marginRight: theme.spacing.md,
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
  },
  logoutContainer: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  logoutButton: {
    borderColor: theme.colors.error,
  },
  logoutText: {
    color: theme.colors.error,
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
    marginTop: theme.spacing.xl,
  },
});

export default SettingsScreen;