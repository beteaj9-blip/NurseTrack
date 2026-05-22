import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bluetooth, CheckCircle, MapPin, Users } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axiosConfig';
import { SkeletonBlock } from '../../components/Skeleton';
import { SlideUpView } from '../../components/SlideUpView';

interface AttendanceStudent {
  studentId: number;
  schoolId: string;
  fullName: string;
  sectionInfo?: string;
  profileImageUrl?: string;
  timeIn?: string;
  timeOut?: string;
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
  timedOutStudentCount: number;
  checkedIn: boolean;
  checkedOut: boolean;
  timeOutOpen: boolean;
  submitted: boolean;
  sessionStartedAt: string | null;
  scheduleOptions: AttendanceScheduleOption[];
  students: AttendanceStudent[];
  presentStudents: AttendanceStudent[];
}

interface ScheduleData {
  id: number;
  hospital?: string;
  ward?: string;
  area?: string;
  shiftDate?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  rawStartTime?: string;
  rawEndTime?: string;
  canceled?: boolean;
  student?: { id?: number; role?: string };
  studentId?: number;
  instructor?: { id?: number; fullName?: string };
  instructorId?: number;
  instructorName?: string;
  studentSection?: string;
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

const hasReachedScheduleEnd = (shiftDate?: string | null, endTime?: string | null) => {
  if (!shiftDate || !endTime) return false;
  const scheduledEnd = new Date(`${shiftDate}T${endTime}`);
  if (Number.isNaN(scheduledEnd.getTime())) return false;
  return Date.now() >= scheduledEnd.getTime();
};

const initialsFor = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'NA';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'NA';
};
const toDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const scheduleSessionKey = (schedule: ScheduleData) => [
  schedule.shiftDate ?? schedule.date ?? '',
  schedule.instructor?.id ?? schedule.instructorId ?? 'instructor',
  schedule.hospital ?? '',
  schedule.ward ?? schedule.area ?? '',
  schedule.rawStartTime ?? schedule.startTime ?? '',
  schedule.rawEndTime ?? schedule.endTime ?? '',
  schedule.studentSection ?? 'section',
].join('|');

const toScheduleOption = (schedule: ScheduleData, scheduledStudentCount: number): AttendanceScheduleOption => ({
  scheduleId: schedule.id,
  hospital: schedule.hospital ?? '',
  ward: schedule.ward ?? schedule.area ?? '',
  shiftDate: schedule.shiftDate ?? schedule.date ?? '',
  startTime: schedule.rawStartTime ?? schedule.startTime ?? '',
  endTime: schedule.rawEndTime ?? schedule.endTime ?? '',
  instructorId: schedule.instructor?.id ?? schedule.instructorId ?? 0,
  instructorName: schedule.instructor?.fullName ?? schedule.instructorName ?? 'Assigned Instructor',
  scheduledStudentCount,
});

const mergeScheduleOptions = (fallbackOptions: AttendanceScheduleOption[], backendOptions: AttendanceScheduleOption[]) => {
  const merged = new Map<number, AttendanceScheduleOption>();
  fallbackOptions.forEach((option) => merged.set(option.scheduleId, option));
  backendOptions.forEach((option) => merged.set(option.scheduleId, option));
  return Array.from(merged.values()).sort((first, second) => first.startTime.localeCompare(second.startTime));
};

const isAttendanceForToday = (attendance: AttendanceToday) => !attendance.hasSchedule || attendance.shiftDate === toDateKey(new Date());

export const DutyAttendanceScreen = () => {
  const { user } = useAuth();
  const isTeacher = user?.role !== 'STUDENT';
  const [attendance, setAttendance] = useState<AttendanceToday | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBluetoothOn, setIsBluetoothOn] = useState(false);
  const [studentStatus, setStudentStatus] = useState<StudentStatus>('ready');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [scheduleChoices, setScheduleChoices] = useState<AttendanceScheduleOption[]>([]);
  const [attendanceCache, setAttendanceCache] = useState<Record<number, AttendanceToday>>({});
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAttendance = async (silent = false, scheduleId = selectedScheduleId) => {
    if (!silent) setIsLoading(true);

    try {
      const response = await api.get<AttendanceToday>('/duties/attendance/today', {
        params: scheduleId ? { scheduleId } : undefined,
      });
      if (!isAttendanceForToday(response.data)) {
        setAttendance(null);
        if (!scheduleId) setSelectedScheduleId(null);
        return;
      }

      setAttendance(response.data);
      if (response.data.scheduleId) {
        setAttendanceCache((current) => ({ ...current, [response.data.scheduleId as number]: response.data }));
      }
      if (!scheduleId && response.data.scheduleId) setSelectedScheduleId(response.data.scheduleId);
      if (response.data.checkedIn) setStudentStatus('connected');
      else if (studentStatus === 'connected') setStudentStatus('ready');
    } catch (error) {
      console.log('Failed to fetch attendance schedule', error);
      setAttendance(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceDetail = async (scheduleId: number) => {
    const response = await api.get<AttendanceToday>('/duties/attendance/today', { params: { scheduleId } });
    return response.data;
  };

  const fetchScheduleChoices = async () => {
    const todayKey = toDateKey(new Date());
    try {
      const response = await api.get<ScheduleData[]>('/schedules/me');
      const todaySchedules = response.data.filter((schedule) => {
        const date = schedule.shiftDate ?? schedule.date;
        return date === todayKey && schedule.canceled !== true;
      });

      const groups = new Map<string, { schedule: ScheduleData; studentIds: Set<number> }>();
      todaySchedules.forEach((schedule) => {
        const key = scheduleSessionKey(schedule);
        const existing = groups.get(key) ?? { schedule, studentIds: new Set<number>() };
        const studentId = schedule.student?.id ?? schedule.studentId;
        const studentRole = schedule.student?.role;
        const instructorId = schedule.instructor?.id ?? schedule.instructorId;
        if (studentId && studentId !== instructorId && studentRole === 'STUDENT') existing.studentIds.add(studentId);
        groups.set(key, existing);
      });

      const choices = Array.from(groups.values())
        .map((group) => toScheduleOption(group.schedule, group.studentIds.size))
        .sort((first, second) => first.startTime.localeCompare(second.startTime));

      setScheduleChoices(choices);
      if (!selectedScheduleId && choices.length > 0) {
        setSelectedScheduleId(choices[0].scheduleId);
      }

      const details = await Promise.allSettled(choices.map((choice) => fetchAttendanceDetail(choice.scheduleId)));
      const nextCache: Record<number, AttendanceToday> = {};
      details.forEach((detail) => {
        if (detail.status === 'fulfilled' && detail.value.scheduleId && isAttendanceForToday(detail.value)) {
          nextCache[detail.value.scheduleId] = detail.value;
        }
      });
      setAttendanceCache((current) => ({ ...current, ...nextCache }));

      const defaultScheduleId = selectedScheduleId ?? choices[0]?.scheduleId;
      if (defaultScheduleId && nextCache[defaultScheduleId]) setAttendance(nextCache[defaultScheduleId]);
    } catch (error) {
      console.log('Failed to fetch attendance schedule choices', error);
      setScheduleChoices([]);
    }
  };

  useEffect(() => {
    void fetchAttendance();
    void fetchScheduleChoices();
  }, [user?.role]);

  useEffect(() => () => {
    if (refreshRef.current) clearInterval(refreshRef.current);
  }, []);

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
        : 'Turn on Bluetooth before scanning for your clinical instructor.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => void openBluetoothSettings() },
        { text: "I've Turned It On", onPress: () => setIsBluetoothOn(true) },
      ]
    );
  };

  const attendanceOptions = attendance?.scheduleOptions ?? [];
  const todayKey = toDateKey(new Date());
  const displayedScheduleOptions = mergeScheduleOptions(scheduleChoices, attendanceOptions)
    .filter((option) => option.shiftDate === todayKey);
  const hasUsableSchedule = (attendance?.hasSchedule === true && attendance.shiftDate === todayKey) || displayedScheduleOptions.length > 0;
  const hasMultipleSchedules = displayedScheduleOptions.length > 1;
  const validSelectedScheduleId = selectedScheduleId && displayedScheduleOptions.some((option) => option.scheduleId === selectedScheduleId) ? selectedScheduleId : null;
  const validAttendanceScheduleId = attendance?.scheduleId && attendance.shiftDate === todayKey ? attendance.scheduleId : null;
  const effectiveScheduleId = validSelectedScheduleId ?? validAttendanceScheduleId ?? displayedScheduleOptions[0]?.scheduleId ?? null;
  const selectedOption = displayedScheduleOptions.find((option) => option.scheduleId === effectiveScheduleId) ?? displayedScheduleOptions[0];
  const selectedAttendance = effectiveScheduleId
    ? attendanceCache[effectiveScheduleId] ?? (attendance?.scheduleId === effectiveScheduleId && attendance.shiftDate === todayKey ? attendance : null)
    : attendance;
  const checkedIn = selectedAttendance?.checkedIn === true;
  const checkedOut = selectedAttendance?.checkedOut === true;
  const needsTimeOut = checkedIn && !checkedOut;
  const localTimeOutOpen = selectedAttendance?.timeOutOpen === true || hasReachedScheduleEnd(selectedAttendance?.shiftDate ?? selectedOption?.shiftDate, selectedAttendance?.endTime ?? selectedOption?.endTime);
  const canTimeOut = needsTimeOut && localTimeOutOpen;

  useEffect(() => {
    if (refreshRef.current) clearInterval(refreshRef.current);
    if (!isTeacher || !effectiveScheduleId || !isBluetoothOn) {
      refreshRef.current = null;
      return;
    }

    refreshRef.current = setInterval(() => void fetchAttendance(true), 5000);
    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current);
    };
  }, [effectiveScheduleId, isBluetoothOn, isTeacher]);

  const requireSchedule = () => {
    if (hasUsableSchedule) return true;
    Alert.alert('No Duty Schedule Today', 'Duty attendance is only available when you have an assigned duty schedule today.');
    return false;
  };

  const hasChosenSchedule = !hasMultipleSchedules || effectiveScheduleId !== null;

  const requireScheduleChoice = () => {
    if (!hasMultipleSchedules || effectiveScheduleId !== null) return true;
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
    if (checkedOut) {
      setStudentStatus('connected');
      return;
    }
    if (needsTimeOut && !canTimeOut) {
      Alert.alert('Time Out Not Open', 'You can time out once the scheduled duty end time is reached.');
      setStudentStatus('connected');
      return;
    }
    if (!ensureBluetoothEnabled('student')) return;
    setStudentStatus('scanning');
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    scanTimeoutRef.current = setTimeout(() => setStudentStatus('found'), 1400);
  };

  const handleConnect = async () => {
    if (!ensureBluetoothEnabled('student') || !effectiveScheduleId) return;
    if (needsTimeOut && !canTimeOut) {
      Alert.alert('Time Out Not Open', 'You can time out once the scheduled duty end time is reached.');
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await api.post<AttendanceToday>(needsTimeOut ? '/duties/attendance/time-out' : '/duties/attendance/time-in', { scheduleId: effectiveScheduleId });
      setAttendance(response.data);
      if (response.data.scheduleId) {
        setAttendanceCache((current) => ({ ...current, [response.data.scheduleId as number]: response.data }));
      }
      setStudentStatus('connected');
    } catch (error) {
      console.log('Failed to record attendance', error);
      Alert.alert('Attendance Not Recorded', needsTimeOut ? 'Please make sure time out is open and try again.' : 'Please make sure you are assigned to today\'s duty schedule and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAttendance = async () => {
    if (!effectiveScheduleId) return;
    if (!localTimeOutOpen) {
      Alert.alert('Submit Not Open', 'Submit attendance after the scheduled time out.');
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await api.post<AttendanceToday>('/duties/attendance/submit', { scheduleId: effectiveScheduleId });
      setAttendance(response.data);
      if (response.data.scheduleId) {
        setAttendanceCache((current) => ({ ...current, [response.data.scheduleId as number]: response.data }));
      }
      Alert.alert('Attendance Submitted', 'Duty attendance was submitted.');
    } catch (error) {
      console.log('Failed to submit attendance', error);
      Alert.alert('Submit Failed', 'Attendance could not be submitted yet.');
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
    setIsBluetoothOn(false);
    setStudentStatus('ready');
    if (attendanceCache[scheduleId]) {
      setAttendance(attendanceCache[scheduleId]);
      return;
    }
    setAttendance(null);
    void fetchAttendance(true, scheduleId);
  };

  const locationLabel = hasUsableSchedule ? `${selectedAttendance?.hospital ?? selectedOption?.hospital} - ${selectedAttendance?.ward ?? selectedOption?.ward}` : 'No duty schedule today';
  const scheduleTime = hasUsableSchedule ? `${formatTime(selectedAttendance?.startTime ?? selectedOption?.startTime)} - ${formatTime(selectedAttendance?.endTime ?? selectedOption?.endTime)}` : '--';
  const scheduledCount = selectedAttendance?.scheduledStudentCount ?? selectedOption?.scheduledStudentCount ?? 0;
  const presentCount = selectedAttendance?.presentStudentCount ?? 0;
  const timedOutCount = selectedAttendance?.timedOutStudentCount ?? 0;
  const presentStudents = selectedAttendance?.presentStudents ?? [];
  const progressPercent = scheduledCount > 0 ? Math.min(100, (presentCount / scheduledCount) * 100) : 0;
  const teacherSubmitDisabled = isLoading || isSubmitting || !hasUsableSchedule || !hasChosenSchedule || presentCount === 0 || selectedAttendance?.submitted || !localTimeOutOpen;
  const studentHeroLabel = isLoading
    ? 'Scan for Clinical Instructor'
    : !hasUsableSchedule
    ? 'No Schedule Today'
    : !hasChosenSchedule
      ? 'Choose Schedule First'
      : checkedOut
        ? 'Time Out Recorded'
        : needsTimeOut
          ? canTimeOut ? 'Scan to Time Out' : 'Time In Recorded'
          : 'Scan for Clinical Instructor';

  if (isTeacher) {
    return (
      <SlideUpView delay={0} duration={600} style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroCircle} />
          <Text style={styles.heroKicker}>TEACHER VIEW</Text>
          <Text style={styles.heroTitle}>Host attendance{String.fromCharCode(10)}signal</Text>
          <TouchableOpacity style={[styles.primaryHeroButton, (isLoading || !hasUsableSchedule) && styles.disabledButton]} onPress={handleTeacherBluetooth} disabled={isLoading}>
            <Text style={styles.primaryHeroButtonText}>
              {isLoading ? 'Turn Bluetooth On' : hasUsableSchedule ? (hasChosenSchedule ? (isBluetoothOn ? 'Turn Bluetooth Off' : 'Turn Bluetooth On') : 'Choose Schedule First') : 'No Schedule Today'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.heroDescription}>
            {isLoading || hasUsableSchedule
              ? 'Turn on Bluetooth to accept check-ins. Saved attendance keeps running even if Bluetooth is turned off.'
              : 'Attendance opens only when you have a scheduled duty assignment today.'}
          </Text>
        </View>

        {hasMultipleSchedules && <ScheduleChooser options={displayedScheduleOptions} selectedScheduleId={effectiveScheduleId} onSelect={handleSelectSchedule} formatTime={formatTime} />}

        <View style={styles.teacherStatusCard}>
          <View style={styles.teacherMetric}>
            <Text style={styles.metricLabel}>TIME IN</Text>
            {isLoading ? <SkeletonBlock width={42} height={18} /> : <Text style={styles.metricValue}>{presentCount}/{scheduledCount}</Text>}
          </View>
          <View style={styles.teacherMetric}>
            <Text style={styles.metricLabel}>TIME OUT</Text>
            {isLoading ? <SkeletonBlock width={42} height={18} /> : <Text style={styles.metricValue}>{timedOutCount}/{presentCount}</Text>}
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        <TouchableOpacity style={[styles.submitAttendanceButton, teacherSubmitDisabled && styles.disabledButton]} onPress={handleSubmitAttendance} disabled={teacherSubmitDisabled}>
          {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitAttendanceButtonText}>Submit Attendance</Text>}
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <View style={styles.infoHeaderRow}>
            <MapPin color="#8A252C" size={18} />
            <Text style={styles.infoKicker}>DUTY LOCATION</Text>
          </View>
          {isLoading ? <SkeletonBlock width="84%" height={22} radius={10} /> : <Text style={styles.infoTitle}>{locationLabel}</Text>}
          {isLoading ? <SkeletonBlock width="72%" height={15} radius={7} style={{ marginTop: 14 }} /> : <Text style={styles.infoBody}>{hasUsableSchedule ? `${scheduleTime} - ${scheduledCount} assigned student(s)` : 'No assigned duty schedule was found for today.'}</Text>}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeaderRow}>
            <Users color="#8A252C" size={18} />
            <Text style={styles.infoKicker}>VERIFIED CHECK-INS</Text>
          </View>
          {isLoading ? (
            <View>
              {Array.from({ length: 3 }).map((_, index) => (
                <View key={`attendance-loading-${index}`} style={styles.studentRow}>
                  <SkeletonBlock width={34} height={34} radius={17} />
                  <View style={{ flex: 1 }}>
                    <SkeletonBlock width="70%" height={13} />
                    <SkeletonBlock width="44%" height={11} style={{ marginTop: 7 }} />
                  </View>
                  <SkeletonBlock width={18} height={18} radius={9} />
                </View>
              ))}
            </View>
          ) : !hasUsableSchedule ? (
            <Text style={styles.emptyStateText}>No roster available today.</Text>
          ) : presentStudents.length === 0 ? (
            <Text style={styles.emptyStateText}>{isBluetoothOn ? 'Waiting for nearby students...' : 'Turn on Bluetooth to start accepting check-ins.'}</Text>
          ) : (
            presentStudents.map((student) => (
              <View key={student.studentId} style={styles.studentRow}>
                <PersonAvatar name={student.fullName} imageUrl={student.profileImageUrl} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>{student.fullName}</Text>
                  <Text style={styles.studentMeta}>{student.timeOut ? 'Timed out' : 'Timed in'} - {student.sectionInfo || student.schoolId}</Text>
                </View>
                <CheckCircle color="#10B981" size={18} />
              </View>
            ))
          )}
        </View>
      </ScrollView>
      </SlideUpView>
    );
  }

  return (
    <SlideUpView delay={0} duration={600} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <View style={styles.heroCircle} />
        <Text style={styles.heroKicker}>STUDENT VIEW</Text>
        <Text style={styles.heroTitle}>Scan and mark{String.fromCharCode(10)}attendance</Text>
        <TouchableOpacity
          style={[styles.primaryHeroButton, (isLoading || !hasUsableSchedule || checkedOut || (needsTimeOut && !canTimeOut)) && styles.disabledButton]}
          onPress={handleScan}
          disabled={isLoading || studentStatus === 'scanning'}
        >
          {studentStatus === 'scanning'
            ? <ActivityIndicator color="#111827" />
            : <Text style={styles.primaryHeroButtonText}>{studentHeroLabel}</Text>}
        </TouchableOpacity>
        <Text style={styles.heroDescription}>
          {isLoading || hasUsableSchedule
            ? 'Scan for your clinical instructor\'s Bluetooth signal and record attendance for today\'s assigned duty.'
            : 'Attendance scanning opens only when you have an assigned duty schedule today.'}
        </Text>
      </View>

      {hasMultipleSchedules && <ScheduleChooser options={displayedScheduleOptions} selectedScheduleId={effectiveScheduleId} onSelect={handleSelectSchedule} formatTime={formatTime} />}

      <View style={styles.signalPanel}>
        <View style={styles.gridOverlay}>
          {Array.from({ length: 8 }).map((_, index) => <View key={`v-${index}`} style={[styles.gridLineVertical, { left: `${index * 14}%` }]} />)}
          {Array.from({ length: 5 }).map((_, index) => <View key={`h-${index}`} style={[styles.gridLineHorizontal, { top: `${index * 24}%` }]} />)}
        </View>
        <Bluetooth color="#8A252C" size={42} opacity={studentStatus === 'ready' ? 0.22 : 0.55} />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          {!isLoading && !hasUsableSchedule && 'No schedule today'}
          {isLoading && 'Ready to scan'}
          {!isLoading && hasUsableSchedule && studentStatus === 'ready' && 'Ready to scan'}
          {!isLoading && hasUsableSchedule && studentStatus === 'scanning' && 'Scanning nearby'}
          {!isLoading && hasUsableSchedule && studentStatus === 'found' && 'Clinical instructor device found'}
          {!isLoading && hasUsableSchedule && studentStatus === 'connected' && (checkedOut ? 'Time out recorded' : checkedIn ? 'Time in recorded' : 'Attendance recorded')}
        </Text>
        <Text style={styles.infoBody}>
          {isLoading && 'Tap scan once your assigned duty schedule is ready.'}
          {!isLoading && !hasUsableSchedule && 'There is no assigned duty schedule available for attendance today.'}
          {!isLoading && hasUsableSchedule && studentStatus === 'ready' && (needsTimeOut ? 'Your time in is saved. Scan again after the scheduled end time to record time out.' : 'Tap scan to find the active clinical instructor device nearby.')}
          {!isLoading && hasUsableSchedule && studentStatus === 'scanning' && 'Keep your phone nearby while NurseTrack searches for the active session.'}
          {!isLoading && hasUsableSchedule && studentStatus === 'found' && (needsTimeOut ? 'A clinical instructor session is available. Connect to record your time out.' : 'A clinical instructor session is available. Connect to record your time in.')}
          {!isLoading && hasUsableSchedule && studentStatus === 'connected' && (checkedOut ? 'Your duty time out has been saved for this session.' : 'Your duty time in has been saved for this session.')}
        </Text>
        {studentStatus === 'found' && (
          <TouchableOpacity style={styles.connectButton} onPress={handleConnect} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.connectButtonText}>{needsTimeOut ? 'Connect and Time Out' : 'Connect and Time In'}</Text>}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoHeaderRow}>
          <MapPin color="#8A252C" size={18} />
          <Text style={styles.infoKicker}>DUTY LOCATION</Text>
        </View>
        {isLoading ? <SkeletonBlock width="84%" height={22} radius={10} /> : <Text style={styles.infoTitle}>{locationLabel}</Text>}
        {isLoading ? <SkeletonBlock width="76%" height={15} radius={7} style={{ marginTop: 14 }} /> : <Text style={styles.infoBody}>{hasUsableSchedule ? `${scheduleTime} - Instructor: ${selectedAttendance?.instructorName || selectedOption?.instructorName || 'Assigned Instructor'}` : 'Attendance will use your assigned schedule when available.'}</Text>}
      </View>
    </ScrollView>
    </SlideUpView>
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

const PersonAvatar = ({ name, imageUrl }: { name: string; imageUrl?: string }) => {
  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={styles.personImage} />;
  }

  return (
    <View style={styles.personFallbackAvatar}>
      <Text style={styles.personFallbackText}>{initialsFor(name)}</Text>
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
    backgroundColor: '#8A252C',
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
  submitAttendanceButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#8A252C',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 14,
  },
  submitAttendanceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
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
