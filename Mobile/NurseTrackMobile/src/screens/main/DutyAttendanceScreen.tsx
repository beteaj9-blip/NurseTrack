import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bluetooth, CheckCircle, MapPin, Users } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axiosConfig';

interface AttendanceStudent {
  studentId: number;
  schoolId: string;
  fullName: string;
  sectionInfo?: string;
  profileImageUrl?: string;
  timeIn?: string;
}

interface AttendanceScheduleOption {
  scheduleId: number;
  hospital: string;
  ward: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  instructorId: number;
  instructorName: string;
  scheduledStudentCount: number;
}

interface AttendanceToday {
  hasSchedule: boolean;
  scheduleId: number | null;
  hospital: string | null;
  ward: string | null;
  shiftDate: string | null;
  startTime: string | null;
  endTime: string | null;
  instructorId: number | null;
  instructorName: string | null;
  scheduledStudentCount: number;
  presentStudentCount: number;
  checkedIn: boolean;
  scheduleOptions: AttendanceScheduleOption[];
  students: AttendanceStudent[];
  presentStudents: AttendanceStudent[];
}

type BluetoothPromptContext = 'student' | 'instructor';
type StudentStatus = 'ready' | 'scanning' | 'found' | 'connected';

const openBluetoothSettings = async () => {
  try {
    const androidLinking = Linking as typeof Linking & {
      sendIntent?: (action: string) => Promise<void>;
    };

    if (Platform.OS === 'android' && androidLinking.sendIntent) {
      await androidLinking.sendIntent('android.settings.BLUETOOTH_SETTINGS');
      return;
    }

    await Linking.openSettings();
  } catch (error) {
    console.log('Unable to open Bluetooth settings', error);
  }
};

const formatTime = (time?: string | null) => {
  if (!time) return '--';
  const [hours = '0', minutes = '00'] = time.split(':');
  const hourNumber = Number(hours);
  const period = hourNumber >= 12 ? 'PM' : 'AM';
  const displayHour = hourNumber % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
};

const formatTimer = (seconds: number) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const remainingSeconds = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
};

const firstInitialFor = (name: string) => name.trim()[0]?.toUpperCase() || 'N';

export const DutyAttendanceScreen = () => {
  const { user } = useAuth();
  const isTeacher = user?.role !== 'STUDENT';
  const [attendance, setAttendance] = useState<AttendanceToday | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBluetoothOn, setIsBluetoothOn] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [studentStatus, setStudentStatus] = useState<StudentStatus>('ready');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [showScheduleChooser, setShowScheduleChooser] = useState(false);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAttendance = async (silent = false, scheduleId = selectedScheduleId) => {
    if (silent) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await api.get<AttendanceToday>('/duties/attendance/today', {
        params: scheduleId ? { scheduleId } : undefined,
      });
      setAttendance(response.data);
      if (!scheduleId && response.data.scheduleId) setSelectedScheduleId(response.data.scheduleId);
      if (response.data.checkedIn) setStudentStatus('connected');
      else if (studentStatus === 'connected') setStudentStatus('ready');
    } catch (error) {
      console.log('Failed to fetch attendance schedule', error);
      setAttendance(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchAttendance();
  }, []);

  useEffect(() => {
    if (!isBluetoothOn) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (refreshRef.current) clearInterval(refreshRef.current);
      timerRef.current = null;
      refreshRef.current = null;
      setSessionTimer(0);
      return;
    }

    setSessionTimer(0);
    timerRef.current = setInterval(() => setSessionTimer((previous) => previous + 1), 1000);
    if (isTeacher) refreshRef.current = setInterval(() => void fetchAttendance(true), 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (refreshRef.current) clearInterval(refreshRef.current);
    };
  }, [isBluetoothOn, isTeacher]);

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };
  }, []);

  const promptEnableBluetooth = (context: BluetoothPromptContext) => {
    Alert.alert(
      'Bluetooth Required',
      context === 'instructor'
        ? 'Turn on Bluetooth before hosting the attendance signal.'
        : 'Turn on Bluetooth before scanning for your teacher.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => void openBluetoothSettings() },
        { text: "I've Turned It On", onPress: () => setIsBluetoothOn(true) },
      ]
    );
  };

  const requireSchedule = () => {
    if (attendance?.hasSchedule) return true;
    Alert.alert('No Duty Schedule Today', 'Duty attendance is only available when you have an assigned duty schedule today.');
    return false;
  };

  const hasMultipleSchedules = (attendance?.scheduleOptions?.length ?? 0) > 1;
  const hasChosenSchedule = !hasMultipleSchedules || selectedScheduleId !== null || attendance?.scheduleId != null;
  const effectiveScheduleId = selectedScheduleId ?? attendance?.scheduleId ?? null;
  const selectedOption = attendance?.scheduleOptions?.find((option) => option.scheduleId === (selectedScheduleId ?? attendance?.scheduleId));

  const requireScheduleChoice = () => {
    if (!hasMultipleSchedules || selectedScheduleId !== null) return true;
    Alert.alert('Choose Schedule', 'Select which duty schedule you want to use for attendance first.');
    return false;
  };

  const ensureBluetoothEnabled = (context: BluetoothPromptContext) => {
    if (!requireSchedule()) return false;
    if (!requireScheduleChoice()) return false;
    if (isBluetoothOn) return true;
    promptEnableBluetooth(context);
    return false;
  };

  const handleScan = () => {
    if (attendance?.checkedIn) {
      setStudentStatus('connected');
      return;
    }
    if (!ensureBluetoothEnabled('student')) return;
    setStudentStatus('scanning');
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    scanTimeoutRef.current = setTimeout(() => setStudentStatus('found'), 1400);
  };

  const handleConnect = async () => {
    if (!ensureBluetoothEnabled('student') || !attendance?.scheduleId) return;
    setIsSubmitting(true);

    try {
      const response = await api.post<AttendanceToday>('/duties/attendance/time-in', { scheduleId: attendance.scheduleId });
      setAttendance(response.data);
      setStudentStatus('connected');
    } catch (error) {
      console.log('Failed to record attendance', error);
      Alert.alert('Attendance Not Recorded', 'Please make sure you are assigned to today\'s duty schedule and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeacherBluetooth = () => {
    if (isBluetoothOn) {
      setIsBluetoothOn(false);
      return;
    }
    if (!requireSchedule()) return;
    if (!requireScheduleChoice()) return;
    promptEnableBluetooth('instructor');
  };

  const handleSelectSchedule = (scheduleId: number) => {
    setSelectedScheduleId(scheduleId);
    setShowScheduleChooser(false);
    setIsBluetoothOn(false);
    setStudentStatus('ready');
    void fetchAttendance(false, scheduleId);
  };

  const locationLabel = attendance?.hasSchedule ? `${attendance.hospital} - ${attendance.ward}` : 'No duty schedule today';
  const scheduleTime = attendance?.hasSchedule ? `${formatTime(attendance.startTime)} - ${formatTime(attendance.endTime)}` : '--';
  const scheduledCount = attendance?.scheduledStudentCount ?? 0;
  const presentCount = attendance?.presentStudentCount ?? 0;
  const progressPercent = scheduledCount > 0 ? Math.min(100, (presentCount / scheduledCount) * 100) : 0;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8A252C" />
      </View>
    );
  }

  if (isTeacher) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#B54827', '#8A252C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
          <View style={styles.heroCircle} />
          <Text style={styles.heroKicker}>TEACHER VIEW</Text>
          <Text style={styles.heroTitle}>Host attendance{String.fromCharCode(10)}signal</Text>
          <TouchableOpacity style={[styles.primaryHeroButton, !attendance?.hasSchedule && styles.disabledButton]} onPress={handleTeacherBluetooth}>
            <Text style={styles.primaryHeroButtonText}>
              {attendance?.hasSchedule ? (hasChosenSchedule ? (isBluetoothOn ? 'Turn Bluetooth Off' : 'Turn Bluetooth On') : 'Choose Schedule First') : 'No Schedule Today'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.heroDescription}>
            {attendance?.hasSchedule
              ? 'Turn on Bluetooth to accept nearby student check-ins for today\'s assigned duty.'
              : 'Attendance opens only when you have a scheduled duty assignment today.'}
          </Text>
        </LinearGradient>

        {hasMultipleSchedules && selectedOption && (
          <SelectedScheduleCard option={selectedOption} onChange={() => setShowScheduleChooser(true)} formatTime={formatTime} />
        )}
        {hasMultipleSchedules && showScheduleChooser && <ScheduleChooser options={attendance?.scheduleOptions ?? []} selectedScheduleId={effectiveScheduleId} onSelect={handleSelectSchedule} formatTime={formatTime} />}

        <View style={styles.teacherStatusCard}>
          <View style={styles.teacherMetric}>
            <Text style={styles.metricLabel}>STATUS</Text>
            <Text style={styles.metricValue}>{attendance?.hasSchedule ? (hasChosenSchedule ? (isBluetoothOn ? 'Active' : 'Bluetooth Off') : 'Choose Schedule') : 'N/A'}</Text>
          </View>
          <View style={styles.teacherMetric}>
            <Text style={styles.metricLabel}>TIMER</Text>
            <Text style={styles.metricValue}>{formatTimer(sessionTimer)}</Text>
          </View>
          <View style={styles.teacherMetric}>
            <Text style={styles.metricLabel}>PRESENT</Text>
            <Text style={styles.metricValue}>{presentCount}/{scheduledCount}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeaderRow}>
            <MapPin color="#8A252C" size={18} />
            <Text style={styles.infoKicker}>DUTY LOCATION</Text>
          </View>
          <Text style={styles.infoTitle}>{locationLabel}</Text>
          <Text style={styles.infoBody}>{attendance?.hasSchedule ? `${scheduleTime} - ${scheduledCount} assigned student(s)` : 'No assigned duty schedule was found for today.'}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeaderRow}>
            <Users color="#8A252C" size={18} />
            <Text style={styles.infoKicker}>VERIFIED CHECK-INS</Text>
            {isRefreshing && <ActivityIndicator color="#8A252C" size="small" />}
          </View>
          {!attendance?.hasSchedule ? (
            <Text style={styles.emptyStateText}>No roster available today.</Text>
          ) : attendance.presentStudents.length === 0 ? (
            <Text style={styles.emptyStateText}>{isBluetoothOn ? 'Waiting for nearby students...' : 'Turn on Bluetooth to start accepting check-ins.'}</Text>
          ) : (
            attendance.presentStudents.map((student) => (
              <View key={student.studentId} style={styles.studentRow}>
                <PersonAvatar name={student.fullName} imageUrl={student.profileImageUrl} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>{student.fullName}</Text>
                  <Text style={styles.studentMeta}>{student.sectionInfo || student.schoolId}</Text>
                </View>
                <CheckCircle color="#10B981" size={18} />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#B54827', '#8A252C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
        <View style={styles.heroCircle} />
        <Text style={styles.heroKicker}>STUDENT VIEW</Text>
        <Text style={styles.heroTitle}>Scan and mark{String.fromCharCode(10)}attendance</Text>
        <TouchableOpacity
          style={[styles.primaryHeroButton, (!attendance?.hasSchedule || attendance?.checkedIn) && styles.disabledButton]}
          onPress={handleScan}
          disabled={studentStatus === 'scanning'}
        >
          {studentStatus === 'scanning'
            ? <ActivityIndicator color="#111827" />
            : <Text style={styles.primaryHeroButtonText}>{attendance?.checkedIn ? 'Attendance Recorded' : attendance?.hasSchedule ? (hasChosenSchedule ? 'Scan for Teacher' : 'Choose Schedule First') : 'No Schedule Today'}</Text>}
        </TouchableOpacity>
        <Text style={styles.heroDescription}>
          {attendance?.hasSchedule
            ? 'Scan for your teacher\'s Bluetooth signal and record attendance for today\'s assigned duty.'
            : 'Attendance scanning opens only when you have an assigned duty schedule today.'}
        </Text>
      </LinearGradient>

      {hasMultipleSchedules && selectedOption && (
        <SelectedScheduleCard option={selectedOption} onChange={() => setShowScheduleChooser(true)} formatTime={formatTime} />
      )}
      {hasMultipleSchedules && showScheduleChooser && <ScheduleChooser options={attendance?.scheduleOptions ?? []} selectedScheduleId={effectiveScheduleId} onSelect={handleSelectSchedule} formatTime={formatTime} />}

      <View style={styles.signalPanel}>
        <View style={styles.gridOverlay}>
          {Array.from({ length: 8 }).map((_, index) => <View key={`v-${index}`} style={[styles.gridLineVertical, { left: `${index * 14}%` }]} />)}
          {Array.from({ length: 5 }).map((_, index) => <View key={`h-${index}`} style={[styles.gridLineHorizontal, { top: `${index * 24}%` }]} />)}
        </View>
        <Bluetooth color="#8A252C" size={42} opacity={studentStatus === 'ready' ? 0.22 : 0.55} />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          {!attendance?.hasSchedule && 'No schedule today'}
          {attendance?.hasSchedule && studentStatus === 'ready' && 'Ready to scan'}
          {attendance?.hasSchedule && studentStatus === 'scanning' && 'Scanning nearby'}
          {attendance?.hasSchedule && studentStatus === 'found' && 'Teacher device found'}
          {attendance?.hasSchedule && studentStatus === 'connected' && 'Attendance recorded'}
        </Text>
        <Text style={styles.infoBody}>
          {!attendance?.hasSchedule && 'There is no assigned duty schedule available for attendance today.'}
          {attendance?.hasSchedule && studentStatus === 'ready' && 'Tap scan to find the active teacher device nearby.'}
          {attendance?.hasSchedule && studentStatus === 'scanning' && 'Keep your phone nearby while NurseTrack searches for the active session.'}
          {attendance?.hasSchedule && studentStatus === 'found' && 'A teacher session is available. Connect to record your attendance.'}
          {attendance?.hasSchedule && studentStatus === 'connected' && 'Your duty attendance has been marked for this session.'}
        </Text>
        {studentStatus === 'found' && (
          <TouchableOpacity style={styles.connectButton} onPress={handleConnect} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.connectButtonText}>Connect and Mark Attendance</Text>}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoHeaderRow}>
          <MapPin color="#8A252C" size={18} />
          <Text style={styles.infoKicker}>DUTY LOCATION</Text>
        </View>
        <Text style={styles.infoTitle}>{locationLabel}</Text>
        <Text style={styles.infoBody}>{attendance?.hasSchedule ? `${scheduleTime} - Instructor: ${attendance.instructorName || 'Assigned Instructor'}` : 'Attendance will use your assigned schedule when available.'}</Text>
      </View>
    </ScrollView>
  );
};

const ScheduleChooser = ({
  options,
  selectedScheduleId,
  onSelect,
  formatTime,
}: {
  options: AttendanceScheduleOption[];
  selectedScheduleId: number | null;
  onSelect: (scheduleId: number) => void;
  formatTime: (time?: string | null) => string;
}) => (
  <View style={styles.scheduleChooserCard}>
    <View style={styles.scheduleChooserHeader}>
      <Text style={styles.infoKicker}>CHOOSE DUTY SCHEDULE</Text>
      <View style={styles.scheduleCountPill}>
        <Text style={styles.scheduleCountText}>{options.length} today</Text>
      </View>
    </View>
    {options.map((option) => {
      const isSelected = selectedScheduleId === option.scheduleId;
      return (
        <TouchableOpacity
          key={option.scheduleId}
          style={[styles.scheduleOptionCard, isSelected && styles.scheduleOptionSelected]}
          onPress={() => onSelect(option.scheduleId)}
          activeOpacity={0.85}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.scheduleOptionTitle}>{option.ward} Duty</Text>
            <Text style={styles.scheduleOptionHospital}>{option.hospital}</Text>
            <Text style={styles.scheduleOptionMeta}>{formatTime(option.startTime)} - {formatTime(option.endTime)} - {option.scheduledStudentCount} student(s)</Text>
          </View>
          <Text style={[styles.scheduleOptionAction, isSelected && styles.scheduleOptionActionSelected]}>{isSelected ? 'Selected' : 'Choose'}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const SelectedScheduleCard = ({
  option,
  onChange,
  formatTime,
}: {
  option: AttendanceScheduleOption;
  onChange: () => void;
  formatTime: (time?: string | null) => string;
}) => (
  <View style={styles.selectedScheduleCard}>
    <View style={{ flex: 1 }}>
      <Text style={styles.infoKicker}>SELECTED DUTY SCHEDULE</Text>
      <Text style={styles.selectedScheduleTitle}>{option.ward} Duty</Text>
      <Text style={styles.selectedScheduleMeta}>{option.hospital} - {formatTime(option.startTime)} to {formatTime(option.endTime)}</Text>
    </View>
    <TouchableOpacity style={styles.changeScheduleButton} onPress={onChange}>
      <Text style={styles.changeScheduleText}>Change</Text>
    </TouchableOpacity>
  </View>
);

const PersonAvatar = ({ name, imageUrl }: { name: string; imageUrl?: string }) => {
  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={styles.personImage} />;
  }

  return (
    <View style={styles.personFallbackAvatar}>
      <Text style={styles.personFallbackText}>{firstInitialFor(name)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2F7',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#EEF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroCard: {
    minHeight: 300,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  heroCircle: {
    position: 'absolute',
    right: -56,
    bottom: -38,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255, 207, 1, 0.22)',
  },
  heroKicker: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 31,
    marginBottom: 18,
  },
  heroDescription: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
    maxWidth: '88%',
  },
  primaryHeroButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#FFCF01',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.72,
  },
  primaryHeroButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
  },
  scheduleChooserCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFF8D7',
    padding: 14,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
  },
  scheduleChooserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  scheduleCountPill: {
    minHeight: 28,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleCountText: {
    color: '#8A252C',
    fontSize: 11,
    fontWeight: '900',
  },
  scheduleOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: '#D8DFEA',
    borderLeftColor: '#FFCF01',
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginTop: 8,
  },
  scheduleOptionSelected: {
    borderColor: '#8A252C',
    borderLeftColor: '#8A252C',
  },
  scheduleOptionTitle: {
    color: '#030B1D',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },
  scheduleOptionHospital: {
    color: '#536B95',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  scheduleOptionMeta: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
  },
  scheduleOptionAction: {
    color: '#8A252C',
    fontSize: 11,
    fontWeight: '900',
  },
  scheduleOptionActionSelected: {
    color: '#047857',
  },
  selectedScheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8DFEA',
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
  },
  selectedScheduleTitle: {
    color: '#030B1D',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
    marginBottom: 4,
  },
  selectedScheduleMeta: {
    color: '#536B95',
    fontSize: 12,
    fontWeight: '800',
  },
  changeScheduleButton: {
    minHeight: 34,
    borderRadius: 99,
    backgroundColor: '#FFF2C2',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeScheduleText: {
    color: '#8A252C',
    fontSize: 12,
    fontWeight: '900',
  },
  signalPanel: {
    minHeight: 112,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8DFEA',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 32,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#EEF1F5',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#EEF1F5',
  },
  infoCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8DFEA',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  infoKicker: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '900',
  },
  infoTitle: {
    color: '#030B1D',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  infoBody: {
    color: '#43526D',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 23,
  },
  connectButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#8A252C',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  teacherStatusCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8DFEA',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  teacherMetric: {
    flex: 1,
    minWidth: 84,
  },
  metricLabel: {
    color: '#43526D',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
  },
  metricValue: {
    color: '#030B1D',
    fontSize: 16,
    fontWeight: '900',
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 99,
    backgroundColor: '#E9EDF3',
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8A252C',
    borderRadius: 99,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    borderTopWidth: 1,
    borderTopColor: '#EEF1F5',
  },
  studentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF8D7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentAvatarText: {
    color: '#8A252C',
    fontSize: 11,
    fontWeight: '900',
  },
  studentName: {
    color: '#030B1D',
    fontSize: 13,
    fontWeight: '900',
  },
  studentMeta: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
  },
  personImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E5E7EB',
  },
  personFallbackAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFCF01',
    justifyContent: 'center',
    alignItems: 'center',
  },
  personFallbackText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '900',
  },
  emptyStateText: {
    color: '#43526D',
    fontSize: 15,
    fontWeight: '900',
    paddingVertical: 12,
  },
});
