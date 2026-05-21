import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { LayoutDashboard, FileText, Calendar, TrendingUp, MessageSquare, BarChart2, Bluetooth } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { CitLogo } from '../components/CitLogo';

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { state, navigation } = props;
  const { user } = useAuth();
  const isTeacher = user?.role !== 'STUDENT';
  const displayRole = isTeacher ? 'Clinical Instructor' : 'Nursing Student';

  const currentRoute = state.routeNames[state.index];

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'DutyAttendance', label: 'Duty Attendance', icon: Bluetooth },
    { name: 'Schedule', label: 'Assigned Schedules', icon: Calendar },
    ...(isTeacher ? [{ name: 'ManualBackup', label: 'Manual Backup', icon: BarChart2 }] : []),
  ];

  return (
    <LinearGradient
      colors={['#982A32', '#8A252C', '#681920']}
      locations={[0, 0.46, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <View style={styles.patternOverlay} pointerEvents="none">
        {Array.from({ length: 28 }).map((_, index) => (
          <View key={index} style={[styles.patternDot, { left: (index % 4) * 72 + 24, top: Math.floor(index / 4) * 72 + 30 }]} />
        ))}
      </View>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <CitLogo size={42} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.logoTitle}>NurseTrack</Text>
              <Text style={styles.logoSubtitle}>CIT-U Nursing</Text>
            </View>
          </View>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{displayRole}</Text>
          </View>
        </View>

        <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
          {menuItems.map((item) => {
            const isActive = currentRoute === item.name;
            const Icon = item.icon;
            
            return (
              <TouchableOpacity
                key={item.name}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => navigation.navigate(item.name)}
              >
                {isActive && <View style={styles.activeRail} />}
                <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                  <Icon color={isActive ? '#111827' : '#FFFFFF'} size={20} />
                </View>
                <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
                  {item.label || item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </DrawerContentScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.profileCard}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <View style={styles.avatarPlaceholder}>
              {user?.profileImageUrl ? (
                <Image source={{ uri: user.profileImageUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarInitials}>
                  {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'JT'}
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName} numberOfLines={1} ellipsizeMode="tail">
                {user?.fullName || 'Jay Yan C. Tiongzon'}
              </Text>
              <Text style={styles.profileEmail} numberOfLines={1} ellipsizeMode="tail">
                {user?.email || 'jay.tiongzon@cit.edu'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#681920',
    overflow: 'hidden',
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  patternDot: {
    position: 'absolute',
    width: 1,
    height: 1,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 207, 1, 0.08)',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    padding: 24,
    paddingTop: 32,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  logoSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  rolePill: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  roleText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  menuItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  activeRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#FFCF01',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerActive: {
    backgroundColor: '#FFCF01',
    borderColor: '#FFCF01',
  },
  menuText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  menuTextActive: {
    color: '#ffffff',
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 12,
    padding: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '900',
  },
  profileName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  profileEmail: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
