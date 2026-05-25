// src/screens/scan/ProviderShowcaseScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  Alert,
  StatusBar,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import theme from '../../utils/theme';

const { width } = Dimensions.get('window');
const CARD_W = (width - 16 * 2 - 12) / 2;

const DUMMY_ITEMS = [
  { id: '1', name: 'Phone Screen Repair', price: 'KSh 1,500', category: 'Repair', available: true, desc: 'All smartphone brands. Same day service.' },
  { id: '2', name: 'Battery Replacement', price: 'KSh 800', category: 'Repair', available: true, desc: 'Original batteries only.' },
  { id: '3', name: 'Laptop Servicing', price: 'KSh 2,000', category: 'Service', available: false, desc: 'Full hardware and software check.' },
  { id: '4', name: 'Data Recovery', price: 'KSh 3,500', category: 'Service', available: true, desc: 'Recover deleted files from any device.' },
  { id: '5', name: 'Charging Port Fix', price: 'KSh 600', category: 'Repair', available: true, desc: 'Fast 30-minute fix.' },
  { id: '6', name: 'Software Unlocking', price: 'KSh 500', category: 'Service', available: true, desc: 'Any network, any device.' },
];

export default function ProviderShowcaseScreen({ route, navigation }) {
  const { provider } = route.params;
  const insets = useSafeAreaInsets();
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [savedItems, setSavedItems] = useState([]);

  const availableFiltered = DUMMY_ITEMS.filter(i => i.available);
  const unavailableFiltered = DUMMY_ITEMS.filter(i => !i.available);

  const getProviderContact = () => {
    const num = (provider.whatsapp || provider.phone || '').replace(/\D/g, '');
    if (!num) {
      Alert.alert('Contact Missing', 'This provider has no contact info yet.');
      return null;
    }
    return num;
  };

  const sendWhatsAppMessage = (num, message) => {
    Linking.openURL(`whatsapp://send?phone=${num}&text=${encodeURIComponent(message)}`)
      .catch(() => Linking.openURL(`https://wa.me/${num}?text=${encodeURIComponent(message)}`));
  };

  const handleInquiry = (item, isQuick = false) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isQuick) {
      const num = getProviderContact();
      if (!num) return;
      const msg = `Hi, I'm interested in: *${item.name}* (${item.price}). Is this available?`;
      sendWhatsAppMessage(num, msg);
    } else {
      setSelectedItem(item);
      setInquiryMessage(`Hi, I'm interested in: ${item.name} (${item.price}).\n\n${item.desc ? `Details: ${item.desc}` : ''}\n\nIs this currently available?`);
      setShowInquiryModal(true);
    }
  };

  const handleCustomInquiry = () => {
    if (!inquiryMessage.trim()) {
      Alert.alert('Message Required', 'Please enter your message.');
      return;
    }
    
    const num = getProviderContact();
    if (!num) return;
    
    sendWhatsAppMessage(num, inquiryMessage);
    setShowInquiryModal(false);
    setInquiryMessage('');
    setSelectedItem(null);
  };

  const handleSaveItem = (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSavedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.filter(i => i.id !== item.id);
      return [...prev, item];
    });
  };

  const ItemCard = ({ item }) => {
    const isSaved = savedItems.some(i => i.id === item.id);
    
    return (
      <View style={[styles.itemCard, !item.available && styles.itemCardDimmed]}>
        <TouchableOpacity 
          style={styles.saveIcon}
          onPress={() => handleSaveItem(item)}
          activeOpacity={0.7}
        >
          <Icon 
            name={isSaved ? "bookmark" : "bookmark-o"} 
            size={16} 
            color={isSaved ? theme.colors.primary : theme.colors.textDim} 
          />
        </TouchableOpacity>
        
        <View style={styles.itemImg}>
          <Icon name="cube" size={28} color="rgba(255,255,255,0.15)" />
          {!item.available && (
            <View style={styles.unavailableOverlay}>
              <Text style={styles.unavailableText}>Unavailable</Text>
            </View>
          )}
        </View>
        
        <View style={styles.itemBody}>
          <View style={styles.itemCatBadge}>
            <Text style={styles.itemCatText}>{item.category}</Text>
          </View>
          
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          {item.desc && <Text style={styles.itemDesc} numberOfLines={2}>{item.desc}</Text>}
          <Text style={styles.itemPrice}>{item.price}</Text>
        </View>
        
        {item.available && (
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => handleInquiry(item, true)}
              activeOpacity={0.8}
            >
              <Icon name="whatsapp" size={12} color="#25D366" />
              <Text style={styles.quickBtnText}>Quick</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.detailBtn}
              onPress={() => handleInquiry(item, false)}
              activeOpacity={0.8}
            >
              <Icon name="comment-o" size={12} color={theme.colors.primary} />
              <Text style={styles.detailBtnText}>Custom</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Single header with provider info */}
      <View style={[styles.header, { marginTop: Platform.OS === 'ios' ? insets.top : 0 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={16} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.providerName}>{provider.name}</Text>
          <Text style={styles.providerMeta}>
            {provider.distance} • {provider.isActive ? 'Available' : 'Offline'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.whatsappBtn}
          onPress={() => {
            const num = getProviderContact();
            if (num) sendWhatsAppMessage(num, `Hello ${provider.name}, I'm interested in your services.`);
          }}
        >
          <Icon name="whatsapp" size={18} color="#25D366" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        {/* Available services */}
        {availableFiltered.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.itemsGrid}>
              {availableFiltered.map(item => <ItemCard key={item.id} item={item} />)}
            </View>
          </View>
        )}

        {/* Unavailable services */}
        {unavailableFiltered.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.unavailableTitle]}>Unavailable</Text>
            <View style={styles.itemsGrid}>
              {unavailableFiltered.map(item => <ItemCard key={item.id} item={item} />)}
            </View>
          </View>
        )}

        {/* Saved items summary */}
        {savedItems.length > 0 && (
          <TouchableOpacity 
            style={styles.savedBar}
            onPress={() => Alert.alert('Saved', savedItems.map(i => i.name).join('\n'))}
          >
            <Icon name="bookmark" size={14} color={theme.colors.primary} />
            <Text style={styles.savedBarText}>{savedItems.length} saved item{savedItems.length > 1 ? 's' : ''}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Inquiry Modal */}
      <Modal
        visible={showInquiryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInquiryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Custom Inquiry</Text>
              <TouchableOpacity onPress={() => setShowInquiryModal(false)}>
                <Icon name="times" size={20} color={theme.colors.textDim} />
              </TouchableOpacity>
            </View>
            
            {selectedItem && (
              <View style={styles.modalItem}>
                <Text style={styles.modalItemName}>{selectedItem.name}</Text>
                <Text style={styles.modalItemPrice}>{selectedItem.price}</Text>
              </View>
            )}
            
            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={6}
              value={inquiryMessage}
              onChangeText={setInquiryMessage}
              placeholder="Type your message here..."
              placeholderTextColor={theme.colors.textMuted}
              textAlignVertical="top"
            />
            
            <TouchableOpacity style={styles.modalSendBtn} onPress={handleCustomInquiry}>
              <Icon name="whatsapp" size={16} color="#fff" />
              <Text style={styles.modalSendBtnText}>Send on WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  
  header: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, 
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    width: 36, 
    height: 36, 
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 1, 
    borderColor: theme.colors.border,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  providerName: {
    fontSize: theme.fontSizes.md,
    fontWeight: '800',
    color: theme.colors.text,
  },
  providerMeta: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textDim,
  },
  whatsappBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#25D36612',
    borderWidth: 1,
    borderColor: '#25D36630',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { 
    padding: 16, 
    gap: 24,
  },
  
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.text,
  },
  unavailableTitle: {
    color: theme.colors.textDim,
  },
  
  itemsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12,
  },
  
  itemCard: {
    width: CARD_W,
    backgroundColor: theme.colors.surface,
    borderWidth: 1, 
    borderColor: theme.colors.border,
    borderRadius: 16, 
    overflow: 'hidden',
    position: 'relative',
  },
  itemCardDimmed: { 
    opacity: 0.55 
  },
  
  saveIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  itemImg: {
    height: CARD_W * 0.6,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center', 
    justifyContent: 'center',
    position: 'relative',
  },
  unavailableOverlay: {
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', 
    paddingVertical: 4, 
    alignItems: 'center',
  },
  unavailableText: { 
    fontSize: 10, 
    fontWeight: '700', 
    color: 'rgba(255,255,255,0.7)' 
  },
  
  itemBody: { 
    padding: 10, 
    gap: 4, 
    flex: 1 
  },
  itemCatBadge: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 7, 
    paddingVertical: 2,
    borderRadius: 6, 
    alignSelf: 'flex-start',
  },
  itemCatText: { 
    fontSize: 9, 
    fontWeight: '600', 
    color: theme.colors.textDim, 
    textTransform: 'uppercase' 
  },
  itemName: { 
    fontSize: theme.fontSizes.sm, 
    fontWeight: '700', 
    color: theme.colors.text, 
    lineHeight: 17 
  },
  itemDesc: { 
    fontSize: 10, 
    color: theme.colors.textDim, 
    lineHeight: 13 
  },
  itemPrice: { 
    fontSize: theme.fontSizes.sm, 
    fontWeight: '800', 
    color: theme.colors.primary, 
    marginTop: 2,
  },
  
  itemActions: { 
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10, 
    paddingBottom: 10,
    marginTop: 4,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 4,
    backgroundColor: '#25D36612',
    borderWidth: 1, 
    borderColor: '#25D36630',
    paddingVertical: 7, 
    borderRadius: 10,
  },
  quickBtnText: { 
    fontSize: 10, 
    fontWeight: '700', 
    color: '#25D366' 
  },
  detailBtn: {
    flex: 1,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 4,
    backgroundColor: theme.colors.primary + '12',
    borderWidth: 1, 
    borderColor: theme.colors.primary + '30',
    paddingVertical: 7, 
    borderRadius: 10,
  },
  detailBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  savedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 8,
  },
  savedBarText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '500',
    color: theme.colors.primary,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '800',
    color: theme.colors.text,
  },
  modalItem: {
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  modalItemName: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalItemPrice: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    minHeight: 120,
  },
  modalSendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalSendBtnText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
    color: '#fff',
  },
});