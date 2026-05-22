import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal, DeviceEventEmitter } from 'react-native';
import { Menu, Bell, User, LogOut } from 'lucide-react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import { CitLogo } from './CitLogo';
import { MainDrawerParamList } from '../navigation/MainNavigator';
import { api } from '../api/axiosConfig';

type MainHeaderProps = {
  navigation: DrawerNavigationProp<MainDrawerParamList>;
  title: string;
  currentRouteName: keyof MainDrawerParamList;
};

type NotificationSummary = {
  unreadCount?: number;
};

export const MainHeader = ({ navigation, title, currentRouteName }: MainHeaderProps) => {
  const { logout, user } = useAuth();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const superTitleText = user?.role === 'STUDENT' ? 'NURSING STUDENT WORKSPACE' : 'CLINICAL INSTRUCTOR WORKSPACE';
  const isNotificationActive = currentRouteName === 'Notification';
  const isProfileActive = currentRouteName === 'Profile';

  useEffect(() => {
    let isMounted = true;

    const loadUnreadCount = async () => {
      try {
        const response = await api.get<NotificationSummary>('/notifications/me/count');
        if (isMounted) setUnreadCount(response.data.unreadCount ?? 0);
      } catch (error) {
        console.log('Failed to fetch notification count', error);
        if (isMounted) setUnreadCount(0);
      }
    };

    void loadUnreadCount();
    const subscription = DeviceEventEmitter.addListener('notifications:changed', loadUnreadCount);

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [currentRouteName, user?.id]);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => navigation.toggleDrawer()}
        >
          <Menu color="#344054" size={24} />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <CitLogo size={18} />
            <Text style={styles.superTitle} numberOfLines={1} ellipsizeMode="tail">
              {superTitleText}
            </Text>
          </View>
          <Text style={styles.screenTitle} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity 
          style={[styles.iconButton, isNotificationActive && styles.iconButtonActive]}
          onPress={() => navigation.navigate('Notification')}
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
        >
          <Bell color={isNotificationActive ? '#FFFFFF' : '#344054'} size={22} />
          {!isNotificationActive && unreadCount > 0 && <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
          </View>}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.iconButton, isProfileActive && styles.iconButtonActive]}
          onPress={() => navigation.navigate('Profile')}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <User color={isProfileActive ? '#FFFFFF' : '#344054'} size={22} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => setIsLogoutModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <LogOut color="#344054" size={22} />
        </TouchableOpacity>
      </View>

      {/* Confirm Logout Modal Dialog */}
      <Modal
        visible={isLogoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.logoutIconCircle}>
              <LogOut color="#FFFFFF" size={30} />
            </View>
             
            <Text style={styles.modalKicker}>CONFIRM LOGOUT</Text>
            <Text style={styles.modalTitle}>Are you sure you want to log out?</Text>
            <Text style={styles.modalSubtitle}>You will return to the NurseTrack login screen.</Text>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setIsLogoutModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalLogoutBtn} 
                onPress={async () => {
                  setIsLogoutModalVisible(false);
                  await logout();
                }}
              >
                <Text style={styles.modalLogoutBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // rough safe area
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    marginRight: 12,
  },
  titleContainer: {
    justifyContent: 'center',
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  superTitle: {
    color: '#667085',
    fontSize: 10,
    fontWeight: '700',
    flexShrink: 1,
    marginLeft: 6,
  },
  screenTitle: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '800',
    flexShrink: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    position: 'relative',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonActive: {
    backgroundColor: '#8A252C',
    borderColor: '#8A252C',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 12,
  },
  logoutIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#8A252C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#8A252C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  modalKicker: {
    color: '#8A252C',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  modalTitle: {
    color: '#1D2939',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#475467',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  modalActionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalCancelBtnText: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '800',
  },
  modalLogoutBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8A252C',
  },
  modalLogoutBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
