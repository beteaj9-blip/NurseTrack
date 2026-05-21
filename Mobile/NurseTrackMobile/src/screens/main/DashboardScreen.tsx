import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { MainDrawerParamList } from '../../navigation/MainNavigator';
import { Calendar, AlertCircle, ArrowRight, Bell, Award } from 'lucide-react-native';
import { api } from '../../api/axiosConfig';

const { width } = Dimensions.get('window');

interface DashboardSchedule {
  id: number;
  hospital?: string;
  ward?: string;
  shiftDate: string;
  startTime?: string;
  endTime?: string;
  canceled?: boolean;
}

const getScheduleEndpoint = (role?: string) => {
  if (role === 'STUDENT') return '/schedules/student';
  if (role === 'INSTRUCTOR') return '/schedules/instructor';
  return '/schedules/all';
};

const toDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const DashboardScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<DrawerNavigationProp<MainDrawerParamList>>();
  const [schedules, setSchedules] = useState<DashboardSchedule[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [scheduleResponse, notificationResponse] = await Promise.all([
          api.get<DashboardSchedule[]>(getScheduleEndpoint(user?.role)),
          api.get<{ unreadCount?: number }>('/notifications/me/count'),
        ]);

        if (!isMounted) return;
        setSchedules(scheduleResponse.data);
        setUnreadCount(notificationResponse.data.unreadCount ?? 0);
      } catch (error) {
        console.log('Failed to load dashboard data', error);
        if (!isMounted) return;
        setSchedules([]);
        setUnreadCount(0);
      } finally {
        if (isMounted) setIsDashboardLoading(false);
      }
    };

    void loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user?.role]);

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Student';
  const isInstructor = user?.role !== 'STUDENT';
  const roleLabel = isInstructor ? 'Teacher' : 'Student';
  const heroDescription = isInstructor
    ? 'Welcome back! Here is a quick look at your assigned students, duty sessions, and attendance tools.'
    : 'Welcome back! Here is a quick look at your clinical schedule and progress.';
  const todayKey = toDateKey(new Date());
  const todaySchedule = useMemo(() => schedules.find((schedule) => schedule.shiftDate === todayKey && !schedule.canceled), [schedules, todayKey]);

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return 'Not set';
    try {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 || 12;
      return `${displayH}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Welcome Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroSubText}>{roleLabel.toUpperCase()} WORKSPACE</Text>
          <Text style={styles.heroTitle}>{getGreeting()}, {firstName}.</Text>
          <Text style={styles.heroDesc}>{heroDescription}</Text>
          <TouchableOpacity 
            style={styles.heroButton}
            onPress={() => navigation.navigate('Schedule')}
          >
            <Text style={styles.heroButtonText}>View schedule</Text>
            <ArrowRight color="#111827" size={16} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
        <View style={styles.heroBgAccent} />
      </View>

      {/* Stats Cards Section */}
      <View style={styles.statsSection}>
        {/* Today's Schedule Card */}
        <View style={styles.statCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(138, 37, 44, 0.1)' }]}>
              <Calendar color="#8A252C" size={22} />
            </View>
          </View>
          <Text style={styles.statTitle}>{todaySchedule ? 'Schedule Today' : 'No Schedule Today'}</Text>
          <Text style={styles.statSubText}>
            {todaySchedule ? `${todaySchedule.ward || 'Assigned duty'}${todaySchedule.hospital ? ` at ${todaySchedule.hospital}` : ''}` : 'No active clinical duty is assigned for today.'}
          </Text>
          
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: todaySchedule ? '100%' : '0%', backgroundColor: '#8A252C' }]} />
            </View>
            <View style={styles.statFooter}>
              <Text style={styles.statTime}>{todaySchedule ? formatTime(todaySchedule.startTime) : 'No duty'}</Text>
              <Text style={styles.statDuration}>{todaySchedule ? `${formatTime(todaySchedule.endTime)} end` : ''}</Text>
            </View>
          </View>
        </View>

        {/* Pending Items Card */}
        <View style={styles.statCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
              <AlertCircle color="#D4A017" size={22} />
            </View>
          </View>
          <Text style={styles.statTitle}>{isInstructor ? 'Unread Updates' : 'Pending Updates'}</Text>
          <Text style={styles.statSubText}>{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'} need your attention.` : 'No unread notifications right now.'}</Text>
          
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: unreadCount > 0 ? '100%' : '0%', backgroundColor: '#FFD700' }]} />
            </View>
            <View style={styles.statFooter}>
              <Text style={styles.statValue}>{isDashboardLoading ? '...' : `${unreadCount} Unread`}</Text>
              <Text style={styles.statPercentage}>{isDashboardLoading ? 'Syncing' : ''}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions Panel */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeading}>Quick Actions</Text>
      </View>
      
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('DutyAttendance')}
        >
          <View style={[styles.actionIconBg, { backgroundColor: '#8A252C' }]}>
            <Calendar color="#FFFFFF" size={20} />
          </View>
          <Text style={styles.actionLabel}>Clock In (Bluetooth)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate(isInstructor ? 'ManualBackup' : 'Notification')}
        >
          <View style={[styles.actionIconBg, { backgroundColor: isInstructor ? '#111827' : '#FFCF01' }]}> 
            {isInstructor ? <Award color="#FFFFFF" size={20} /> : <Bell color="#111827" size={20} />}
          </View>
          <Text style={styles.actionLabel}>{isInstructor ? 'Manual Backup' : 'Notifications'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: '#8A252C',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#8A252C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  heroLeft: {
    zIndex: 2,
    position: 'relative',
  },
  heroSubText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroDesc: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: '85%',
  },
  heroButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heroButtonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  heroBgAccent: {
    position: 'absolute',
    right: -40,
    bottom: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    zIndex: 1,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTitle: {
    color: '#101828',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  statSubText: {
    color: '#475467',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 16,
    minHeight: 32,
  },
  progressSection: {
    marginTop: 'auto',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F2F4F7',
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
  },
  statFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statTime: {
    color: '#101828',
    fontSize: 14,
    fontWeight: '800',
  },
  statDuration: {
    color: '#667085',
    fontSize: 11,
    fontWeight: '600',
  },
  statValue: {
    color: '#101828',
    fontSize: 14,
    fontWeight: '800',
  },
  statPercentage: {
    color: '#667085',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionHeading: {
    color: '#101828',
    fontSize: 16,
    fontWeight: '800',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    color: '#344054',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
