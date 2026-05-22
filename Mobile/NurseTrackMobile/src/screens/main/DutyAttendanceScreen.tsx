import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, Image, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckCircle, MapPin, Users, Bluetooth, RefreshCw } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axiosConfig';
import { SkeletonBlock } from '../../components/Skeleton';
import { SlideUpView } from '../../components/SlideUpView';
import { BluetoothService } from '../../services/BluetoothService';

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
  instructorBroadcasting?: boolean;
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

const calculateElapsedMinutes = (sessionStartedAt: string | null, shiftDate: string | null, startTime: string | null): number => {
  let startMs = 0;
  if (sessionStartedAt) {
    const parsed = Date.parse(sessionStartedAt);
    if (!Number.isNaN(parsed)) {
      startMs = parsed;
    }
  }
  
  if (startMs === 0 && shiftDate && startTime) {
    const timePart = startTime.includes(':') ? startTime : '00:00';
    const parsed = Date.parse(`${shiftDate}T${timePart}`);
    if (!Number.isNaN(parsed)) {
      startMs = parsed;
    }
  }
  
  if (startMs === 0) return 0;
  
  const elapsedMs = Date.now() - startMs;
  if (elapsedMs < 0) return 0;
  
  return Math.floor(elapsedMs / (1000 * 60));
};

const formatElapsed = (minutes: number): string => {
  if (minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
};

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
  const [isSessionDisconnected, setIsSessionDisconnected] = useState(false);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshRef = useRef<NodeJS.Timeout | null>(null);
  const [isHosting, setIsHosting] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRefreshing) {
      spinAnim.setValue(0);
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.setValue(0);
    }
  }, [isRefreshing, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    if (BluetoothService.isRealBleAvailable()) {
      void BluetoothService.requestBluetoothPermissions().then((granted) => {
        if (!granted) {
          console.log('Bluetooth permissions not granted.');
        }
      });
    }

    const unsubscribe = BluetoothService.subscribeToState((state) => {
      setIsBluetoothOn(state);
    });
    return () => {
      unsubscribe();
    };
  }, []);

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
      if (isTeacher) {
        setIsHosting(response.data.instructorBroadcasting === true);
      }
      if (response.data.scheduleId) {
        setAttendanceCache((current) => ({ ...current, [response.data.scheduleId as number]: response.data }));
      }
      if (!scheduleId && response.data.scheduleId) setSelectedScheduleId(response.data.scheduleId);
      if (response.data.checkedIn) {
        if (studentStatus !== 'scanning' && studentStatus !== 'found') {
          setStudentStatus('connected');
        }
        if (response.data.checkedOut === false && response.data.instructorBroadcasting === false) {
          setIsSessionDisconnected(true);
        }
      } else if (studentStatus === 'connected') {
        setStudentStatus('ready');
      }
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
      if (defaultScheduleId && nextCache[defaultScheduleId]) {
        setAttendance(nextCache[defaultScheduleId]);
        if (isTeacher) {
          setIsHosting(nextCache[defaultScheduleId].instructorBroadcasting === true);
        }
      }
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

  const updateTeacherBroadcasting = async (broadcasting: boolean, scheduleId: number) => {
    try {
      await api.post('/duties/attendance/broadcast', {
        scheduleId,
        broadcasting,
      });
    } catch (error) {
      console.log('Failed to update teacher broadcasting status', error);
    }
  };

  const promptEnableBluetooth = (context: BluetoothPromptContext) => {
    Alert.alert(
      'Bluetooth Required',
      context === 'instructor'
        ? 'Turn on Bluetooth before hosting the attendance signal.'
        : 'Turn on Bluetooth before scanning for your clinical instructor.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => void openBluetoothSettings() },
        {
          text: "I've Turned It On",
          onPress: () => {
            if (BluetoothService.isRealBleAvailable()) {
              void BluetoothService.requestBluetoothPermissions().then((granted) => {
                if (!granted) {
                  Alert.alert('Permission Denied', 'Please grant Bluetooth permissions to use this feature.');
                  return;
                }
                void BluetoothService.checkBluetoothState().then((state) => {
                  setIsBluetoothOn(state);
                  if (state) {
                    if (context === 'instructor' && effectiveScheduleId) {
                      void updateTeacherBroadcasting(true, effectiveScheduleId);
                    }
                  } else {
                    Alert.alert('Bluetooth Offline', 'Please enable Bluetooth in your device settings first.');
                  }
                });
              });
            } else {
              setIsBluetoothOn(true);
              BluetoothService.setSimulatedState(true);
              if (context === 'instructor' && effectiveScheduleId) {
                void updateTeacherBroadcasting(true, effectiveScheduleId);
              }
            }
          },
        },
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
    
    const shouldPoll = isTeacher
      ? (effectiveScheduleId && isBluetoothOn)
      : (effectiveScheduleId && checkedIn && !checkedOut);

    if (!shouldPoll) {
      refreshRef.current = null;
      return;
    }

    refreshRef.current = setInterval(() => void fetchAttendance(true), 5000);
    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current);
    };
  }, [effectiveScheduleId, isBluetoothOn, isTeacher, checkedIn, checkedOut]);

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
    if (studentStatus === 'scanning') {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      setStudentStatus(checkedIn ? 'connected' : 'ready');
      return;
    }
    if (!isBluetoothOn) {
      promptEnableBluetooth('student');
      return;
    }
    if (checkedOut) {
      setStudentStatus('connected');
      return;
    }
    if (needsTimeOut && !canTimeOut && !isActiveSessionDisconnected) {
      Alert.alert('Time Out Not Open', 'You can time out once the scheduled duty end time is reached.');
      setStudentStatus('connected');
      return;
    }
    setStudentStatus('scanning');
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    scanTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await api.get<AttendanceToday>('/duties/attendance/today', {
          params: effectiveScheduleId ? { scheduleId: effectiveScheduleId } : undefined,
        });
        setAttendance(response.data);
        if (response.data.scheduleId) {
          setAttendanceCache((current) => ({
            ...current,
            [response.data.scheduleId as number]: response.data,
          }));
        }

        if (response.data.instructorBroadcasting === true) {
          if (checkedIn && !canTimeOut) {
            setStudentStatus('connected');
            setIsSessionDisconnected(false);
            Alert.alert('Session Reconnected', 'You have successfully reconnected to your Clinical Instructor.');
          } else {
            setStudentStatus('found');
            setIsSessionDisconnected(false);
          }
        } else {
          setStudentStatus(checkedIn ? 'connected' : 'ready');
          Alert.alert(
            'Instructor Signal Not Found',
            "We couldn't detect your Clinical Instructor's Bluetooth signal. Make sure your instructor has turned on their Bluetooth signal and try again."
          );
        }
      } catch (error) {
        console.log('Failed to verify instructor signal during scan', error);
        setStudentStatus(checkedIn ? 'connected' : 'ready');
        Alert.alert(
          'Connection Error',
          'Failed to scan nearby devices. Please check your connection and try again.'
        );
      }
    }, 1400);
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
      setIsSessionDisconnected(false);
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

  const handleTeacherBluetooth = async () => {
    if (isBluetoothOn) {
      if (BluetoothService.isRealBleAvailable()) {
        Alert.alert('Turn Off Bluetooth', 'Please turn off Bluetooth in your device settings to host offline.');
        return;
      }
      setIsBluetoothOn(false);
      BluetoothService.setSimulatedState(false);
      setIsHosting(false);
      if (effectiveScheduleId) {
        void updateTeacherBroadcasting(false, effectiveScheduleId);
      }
      return;
    }
    if (!requireSchedule()) return;
    if (!requireScheduleChoice()) return;

    if (BluetoothService.isRealBleAvailable()) {
      const granted = await BluetoothService.requestBluetoothPermissions();
      if (!granted) {
        Alert.alert('Permission Required', 'Bluetooth permissions are required to check/enable Bluetooth.');
        return;
      }
    }
    promptEnableBluetooth('instructor');
  };

  const handleToggleHosting = async () => {
    if (!effectiveScheduleId) return;
    if (!isBluetoothOn) {
      Alert.alert('Bluetooth Required', 'Please turn on Bluetooth first before starting to host the attendance signal.');
      return;
    }
    const nextHosting = !isHosting;
    setIsHosting(nextHosting);
    setAttendanceCache((current) => {
      const existing = current[effectiveScheduleId];
      if (existing) {
        return {
          ...current,
          [effectiveScheduleId]: {
            ...existing,
            instructorBroadcasting: nextHosting,
          },
        };
      }
      return current;
    });
    setAttendance((current) => {
      if (current && current.scheduleId === effectiveScheduleId) {
        return {
          ...current,
          instructorBroadcasting: nextHosting,
        };
      }
      return current;
    });
    await updateTeacherBroadcasting(nextHosting, effectiveScheduleId);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      await Promise.all([
        fetchAttendance(true), // call silently so fetchAttendance does not toggle isLoading early
        fetchScheduleChoices()
      ]);
    } catch (error) {
      console.log('Refresh failed', error);
    } finally {
      // Ensure the loading skeleton and spin animations are shown for at least 800ms to be visually clear and smooth
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  const handleSelectSchedule = (scheduleId: number) => {
    if (isTeacher && isBluetoothOn && effectiveScheduleId) {
      void updateTeacherBroadcasting(false, effectiveScheduleId);
    }
    setSelectedScheduleId(scheduleId);
    if (!BluetoothService.isRealBleAvailable()) {
      setIsBluetoothOn(false);
      BluetoothService.setSimulatedState(false);
    }
    setIsHosting(false);
    setStudentStatus('ready');
    setIsSessionDisconnected(false);
    if (attendanceCache[scheduleId]) {
      setAttendance(attendanceCache[scheduleId]);
      setIsHosting(attendanceCache[scheduleId].instructorBroadcasting === true);
      return;
    }
    setAttendance(null);
    void fetchAttendance(true, scheduleId);
  };

  useEffect(() => {
    if (selectedAttendance) {
      setIsHosting(selectedAttendance.instructorBroadcasting === true);
    }
  }, [selectedAttendance?.instructorBroadcasting]);

  useEffect(() => {
    const updateElapsed = () => {
      const startAt = selectedAttendance?.sessionStartedAt ?? null;
      const sDate = selectedAttendance?.shiftDate ?? selectedOption?.shiftDate ?? null;
      const sTime = selectedAttendance?.startTime ?? selectedOption?.startTime ?? null;
      
      const mins = calculateElapsedMinutes(startAt, sDate, sTime);
      setElapsedMinutes(mins);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 30000);
    return () => clearInterval(interval);
  }, [selectedAttendance?.sessionStartedAt, selectedAttendance?.shiftDate, selectedAttendance?.startTime, selectedOption?.shiftDate, selectedOption?.startTime]);

  useEffect(() => {
    if (isTeacher && !isBluetoothOn && effectiveScheduleId) {
      void updateTeacherBroadcasting(false, effectiveScheduleId);
    }
    return () => {
      if (isTeacher && isBluetoothOn && effectiveScheduleId) {
        void updateTeacherBroadcasting(false, effectiveScheduleId);
      }
    };
  }, [isTeacher, isBluetoothOn, effectiveScheduleId]);

  useEffect(() => {
    if (checkedIn && !checkedOut) {
      if (!isBluetoothOn) {
        setIsSessionDisconnected(true);
      }
    } else {
      setIsSessionDisconnected(false);
    }
  }, [checkedIn, checkedOut, isBluetoothOn]);

  const locationLabel = hasUsableSchedule ? `${selectedAttendance?.hospital ?? selectedOption?.hospital} - ${selectedAttendance?.ward ?? selectedOption?.ward}` : 'No duty schedule today';
  const scheduleTime = hasUsableSchedule ? `${formatTime(selectedAttendance?.startTime ?? selectedOption?.startTime)} - ${formatTime(selectedAttendance?.endTime ?? selectedOption?.endTime)}` : '--';
  const getStudentTimeIn = () => {
    const currentStudent = selectedAttendance?.students?.find((s) => s.studentId === user?.id) 
      ?? selectedAttendance?.presentStudents?.find((s) => s.studentId === user?.id);
    if (currentStudent?.timeIn) {
      return formatTime(currentStudent.timeIn);
    }
    if (selectedAttendance?.sessionStartedAt) {
      try {
        const timeStr = new Date(selectedAttendance.sessionStartedAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        return formatTime(timeStr);
      } catch {
        // ignore
      }
    }
    return formatTime(selectedAttendance?.startTime ?? selectedOption?.startTime);
  };
  const scheduledCount = selectedAttendance?.scheduledStudentCount ?? selectedOption?.scheduledStudentCount ?? 0;
  const presentCount = selectedAttendance?.presentStudentCount ?? 0;
  const timedOutCount = selectedAttendance?.timedOutStudentCount ?? 0;
  const presentStudents = selectedAttendance?.presentStudents ?? [];
  const progressPercent = scheduledCount > 0 ? Math.min(100, (presentCount / scheduledCount) * 100) : 0;
  const teacherSubmitDisabled = isLoading || isSubmitting || !hasUsableSchedule || !hasChosenSchedule || presentCount === 0 || selectedAttendance?.submitted || !localTimeOutOpen;

  const isActiveSessionDisconnected = isSessionDisconnected;

  const isSignalPanelHidden = checkedIn && studentStatus !== 'scanning' && studentStatus !== 'found' && !isActiveSessionDisconnected;

  const studentHeroLabel = isLoading
    ? 'Scan for Clinical Instructor'
    : studentStatus === 'scanning'
      ? 'Stop Scan'
      : !hasUsableSchedule
      ? 'No Schedule Today'
      : !hasChosenSchedule
        ? 'Choose Schedule First'
        : checkedOut
          ? 'Time Out Recorded'
          : isActiveSessionDisconnected
            ? 'Scan to Reconnect'
            : needsTimeOut
              ? canTimeOut ? 'Scan to Time Out' : 'Time In Recorded'
              : 'Scan for Clinical Instructor';

  const getStudentInfoTitle = () => {
    if (isLoading) return 'Ready to scan';
    if (!hasUsableSchedule) return 'No schedule today';
    if (checkedOut) return 'Time out recorded';
    if (isActiveSessionDisconnected) return 'Active Session - Bluetooth Disconnected';

    switch (studentStatus) {
      case 'scanning':
        return 'Scanning nearby';
      case 'found':
        return 'Clinical instructor device found';
      case 'connected':
        return checkedIn ? 'Time in recorded' : 'Attendance recorded';
      case 'ready':
      default:
        return 'Ready to scan';
    }
  };

  const getStudentInfoBody = () => {
    if (isLoading) return 'Tap scan once your assigned duty schedule is ready.';
    if (!hasUsableSchedule) return 'There is no assigned duty schedule available for attendance today.';
    if (checkedOut) return 'Your duty time out has been saved for this session.';
    if (isActiveSessionDisconnected) {
      return 'You have an active duty session, but you are not connected to Bluetooth. You must turn on Bluetooth or connect back to your Clinical Instructor to perform a Time Out.';
    }

    switch (studentStatus) {
      case 'scanning':
        return 'Keep your phone nearby while NurseTrack searches for the active session.';
      case 'found':
        return needsTimeOut
          ? 'A clinical instructor session is available. Connect to record your time out.'
          : 'A clinical instructor session is available. Connect to record your time in.';
      case 'connected':
        return 'Your duty time in has been saved for this session.';
      case 'ready':
      default:
        return needsTimeOut
          ? 'Your time in is saved. Scan again after the scheduled end time to record time out.'
          : 'Tap scan to find the active clinical instructor device nearby.';
    }
  };

  if (isTeacher) {
    return (
      <SlideUpView delay={0} duration={600} style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroCircle} />
          
          {isRefreshing ? (
            <TouchableOpacity 
              style={[styles.refreshButton, { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 0 }]} 
              disabled={true}
            >
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <RefreshCw color="#FFFFFF" size={18} />
              </Animated.View>
            </TouchableOpacity>
          ) : isLoading ? (
            <View style={[styles.refreshButton, { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 0, overflow: 'hidden' }]}>
              <SkeletonBlock width={38} height={38} radius={19} style={{ opacity: 0.3 }} />
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={handleRefresh}
              activeOpacity={0.7}
            >
              <RefreshCw color="#FFFFFF" size={18} />
            </TouchableOpacity>
          )}

          <Text style={styles.heroKicker}>TEACHER VIEW</Text>
          <Text style={styles.heroTitle}>Host attendance{String.fromCharCode(10)}signal</Text>
          
          {isLoading ? (
            <SkeletonBlock width="100%" height={54} radius={14} style={{ marginBottom: 16, opacity: 0.3 }} />
          ) : (
            <TouchableOpacity 
              style={[
                styles.primaryHeroButton, 
                (!hasUsableSchedule || !isBluetoothOn) && styles.disabledButton
              ]} 
              onPress={handleToggleHosting} 
              disabled={!hasUsableSchedule || !isBluetoothOn}
            >
              <Text style={styles.primaryHeroButtonText}>
                {!hasUsableSchedule 
                  ? 'No Schedule Today' 
                  : !isBluetoothOn 
                    ? 'Bluetooth Required to Host' 
                    : isHosting 
                      ? 'Stop Hosting Signal' 
                      : 'Start Hosting'}
              </Text>
            </TouchableOpacity>
          )}
          <Text style={styles.heroDescription}>
            {isLoading || hasUsableSchedule
              ? 'Turn on Bluetooth and tap "Start Hosting" to accept check-ins. Saved attendance keeps running even if Bluetooth is turned off.'
              : 'Attendance opens only when you have a scheduled duty assignment today.'}
          </Text>
        </View>

        {(hasMultipleSchedules || isLoading) && (
          <ScheduleChooser 
            options={displayedScheduleOptions} 
            selectedScheduleId={effectiveScheduleId} 
            onSelect={handleSelectSchedule} 
            formatTime={formatTime} 
            isLoading={isLoading}
          />
        )}

        {(hasUsableSchedule || isLoading) && (
          <View style={styles.bluetoothStatusCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.bluetoothIconCircle, isBluetoothOn ? styles.bluetoothActive : styles.bluetoothInactive]}>
                  <Bluetooth color={isBluetoothOn ? '#FFFFFF' : '#64748B'} size={20} />
                </View>
                <View style={{ minWidth: 120 }}>
                  <Text style={styles.bluetoothCardTitle}>
                    {isLoading ? (
                      <SkeletonBlock width={120} height={14} radius={7} />
                    ) : BluetoothService.isRealBleAvailable() ? (
                      'Device Bluetooth'
                    ) : (
                      'Simulated Bluetooth'
                    )}
                  </Text>
                  <Text style={styles.bluetoothCardStatus}>
                    {isLoading ? (
                      <SkeletonBlock width={90} height={12} radius={6} style={{ marginTop: 4 }} />
                    ) : isBluetoothOn ? (
                      BluetoothService.isRealBleAvailable() ? 'Hardware Connected' : 'Active & Discoverable'
                    ) : (
                      BluetoothService.isRealBleAvailable() ? 'Hardware Disabled' : 'Disabled / Off'
                    )}
                  </Text>
                </View>
              </View>
              {isLoading ? (
                <SkeletonBlock width={80} height={32} radius={16} />
              ) : (
                <TouchableOpacity
                  style={[styles.bluetoothToggleBtn, isBluetoothOn ? styles.bluetoothToggleBtnActive : styles.bluetoothToggleBtnInactive]}
                  onPress={handleTeacherBluetooth}
                >
                  <Text style={[styles.bluetoothToggleBtnText, isBluetoothOn ? styles.bluetoothToggleBtnTextActive : styles.bluetoothToggleBtnTextInactive]}>
                    {BluetoothService.isRealBleAvailable() ? (isBluetoothOn ? 'Device On' : 'Turn On') : (isBluetoothOn ? 'Turn Off' : 'Turn On')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={styles.teacherStatusCard}>
          <View style={styles.teacherMetric}>
            <Text style={styles.metricLabel}>TIME IN</Text>
            {isLoading ? <SkeletonBlock width={42} height={18} /> : <Text style={styles.metricValue}>{presentCount}/{scheduledCount}</Text>}
          </View>
          <View style={styles.teacherMetric}>
            <Text style={styles.metricLabel}>TIME OUT</Text>
            {isLoading ? <SkeletonBlock width={42} height={18} /> : <Text style={styles.metricValue}>{timedOutCount}/{presentCount}</Text>}
          </View>
          <View style={styles.teacherMetric}>
            <Text style={styles.metricLabel}>ELAPSED</Text>
            {isLoading ? <SkeletonBlock width={42} height={18} /> : <Text style={styles.metricValue}>{formatElapsed(elapsedMinutes)}</Text>}
          </View>
          <View style={styles.progressTrack}>
            {isLoading ? (
              <SkeletonBlock width="100%" height={10} radius={5} style={{ opacity: 0.3 }} />
            ) : (
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            )}
          </View>
        </View>

        {isLoading ? (
          <SkeletonBlock width="91%" height={50} radius={14} style={{ marginHorizontal: 16, marginBottom: 14, opacity: 0.3 }} />
        ) : (
          <TouchableOpacity style={[styles.submitAttendanceButton, teacherSubmitDisabled && styles.disabledButton]} onPress={handleSubmitAttendance} disabled={teacherSubmitDisabled}>
            {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitAttendanceButtonText}>Submit Attendance</Text>}
          </TouchableOpacity>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoHeaderRow}>
            <MapPin color="#8A252C" size={18} />
            <Text style={styles.infoKicker}>DUTY LOCATION</Text>
          </View>
          {isLoading ? <SkeletonBlock width="84%" height={22} radius={10} style={{ marginBottom: 12 }} /> : <Text style={styles.infoTitle}>{locationLabel}</Text>}
          {isLoading ? <SkeletonBlock width="72%" height={15} radius={7} /> : <Text style={styles.infoBody}>{hasUsableSchedule ? `${scheduleTime} - ${scheduledCount} assigned student(s)` : 'No assigned duty schedule was found for today.'}</Text>}
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
        
        {isRefreshing ? (
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 0 }]} 
            disabled={true}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <RefreshCw color="#FFFFFF" size={18} />
            </Animated.View>
          </TouchableOpacity>
        ) : isLoading ? (
          <View style={[styles.refreshButton, { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 0, overflow: 'hidden' }]}>
            <SkeletonBlock width={38} height={38} radius={19} style={{ opacity: 0.3 }} />
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={handleRefresh}
            activeOpacity={0.7}
          >
            <RefreshCw color="#FFFFFF" size={18} />
          </TouchableOpacity>
        )}

        <Text style={styles.heroKicker}>STUDENT VIEW</Text>
        <Text style={styles.heroTitle}>Scan and mark{String.fromCharCode(10)}attendance</Text>
        
        {isLoading ? (
          <SkeletonBlock width="100%" height={54} radius={14} style={{ marginBottom: 16, opacity: 0.3 }} />
        ) : (
          <TouchableOpacity
            style={[styles.primaryHeroButton, (!hasUsableSchedule || checkedOut || (needsTimeOut && !canTimeOut && studentStatus !== 'scanning' && !isActiveSessionDisconnected)) && styles.disabledButton]}
            onPress={handleScan}
          >
            {studentStatus === 'scanning' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator color="#111827" size="small" />
                <Text style={styles.primaryHeroButtonText}>{studentHeroLabel}</Text>
              </View>
            ) : (
              <Text style={styles.primaryHeroButtonText}>{studentHeroLabel}</Text>
            )}
          </TouchableOpacity>
        )}
        <Text style={styles.heroDescription}>
          {isLoading || hasUsableSchedule
            ? 'Scan for your clinical instructor\'s Bluetooth signal and record attendance for today\'s assigned duty.'
            : 'Attendance scanning opens only when you have an assigned duty schedule today.'}
        </Text>
      </View>

      {(hasMultipleSchedules || isLoading) && (
        <ScheduleChooser 
          options={displayedScheduleOptions} 
          selectedScheduleId={effectiveScheduleId} 
          onSelect={handleSelectSchedule} 
          formatTime={formatTime} 
          isLoading={isLoading}
        />
      )}

      {(hasUsableSchedule || isLoading) && (checkedIn || isLoading) && (
        <View style={styles.studentStatusCard}>
          <View style={styles.studentMetric}>
            <Text style={styles.metricLabel}>CHECK-IN TIME</Text>
            {isLoading ? (
              <SkeletonBlock width={64} height={18} radius={9} />
            ) : (
              <Text style={styles.metricValue}>{getStudentTimeIn()}</Text>
            )}
          </View>
          <View style={styles.studentMetric}>
            <Text style={styles.metricLabel}>DUTY ELAPSED</Text>
            {isLoading ? (
              <SkeletonBlock width={64} height={18} radius={9} />
            ) : (
              <Text style={styles.metricValue}>{formatElapsed(elapsedMinutes)}</Text>
            )}
          </View>
        </View>
      )}

      {(hasUsableSchedule || isLoading) && (
        <View style={styles.bluetoothStatusCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.bluetoothIconCircle, isBluetoothOn ? styles.bluetoothActive : styles.bluetoothInactive]}>
                <Bluetooth color={isBluetoothOn ? '#FFFFFF' : '#64748B'} size={20} />
              </View>
              <View style={{ minWidth: 120 }}>
                <Text style={styles.bluetoothCardTitle}>
                  {isLoading ? (
                    <SkeletonBlock width={120} height={14} radius={7} />
                  ) : BluetoothService.isRealBleAvailable() ? (
                    'Device Bluetooth'
                  ) : (
                    'Simulated Bluetooth'
                  )}
                </Text>
                <Text style={styles.bluetoothCardStatus}>
                  {isLoading ? (
                    <SkeletonBlock width={90} height={12} radius={6} style={{ marginTop: 4 }} />
                  ) : isBluetoothOn ? (
                    BluetoothService.isRealBleAvailable() ? 'Hardware Connected' : 'Active & Discoverable'
                  ) : (
                    BluetoothService.isRealBleAvailable() ? 'Hardware Disabled' : 'Disabled / Off'
                  )}
                </Text>
              </View>
            </View>
            {isLoading ? (
              <SkeletonBlock width={80} height={32} radius={16} />
            ) : (
              <TouchableOpacity
                style={[styles.bluetoothToggleBtn, isBluetoothOn ? styles.bluetoothToggleBtnActive : styles.bluetoothToggleBtnInactive]}
                onPress={async () => {
                  if (BluetoothService.isRealBleAvailable()) {
                    const granted = await BluetoothService.requestBluetoothPermissions();
                    if (!granted) {
                      Alert.alert('Permission Required', 'Bluetooth permissions are required to check/enable Bluetooth.');
                      return;
                    }
                    if (isBluetoothOn) {
                      Alert.alert('Turn Off Bluetooth', 'Please turn off Bluetooth in your device settings.');
                    } else {
                      void openBluetoothSettings();
                    }
                    return;
                  }
                  const nextState = !isBluetoothOn;
                  setIsBluetoothOn(nextState);
                  BluetoothService.setSimulatedState(nextState);
                  if (!nextState) {
                    if (checkedIn && !checkedOut) {
                      setIsSessionDisconnected(true);
                    }
                    if (studentStatus === 'scanning' || studentStatus === 'found') {
                      setStudentStatus(checkedIn ? 'connected' : 'ready');
                    }
                  }
                }}
              >
                <Text style={[styles.bluetoothToggleBtnText, isBluetoothOn ? styles.bluetoothToggleBtnTextActive : styles.bluetoothToggleBtnTextInactive]}>
                  {BluetoothService.isRealBleAvailable() ? (isBluetoothOn ? 'Device On' : 'Turn On') : (isBluetoothOn ? 'Turn Off' : 'Turn On')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {!isSignalPanelHidden && (
        <View style={styles.signalPanel}>
          <View style={styles.gridOverlay}>
            {Array.from({ length: 8 }).map((_, index) => <View key={`v-${index}`} style={[styles.gridLineVertical, { left: `${index * 14}%` }]} />)}
            {Array.from({ length: 5 }).map((_, index) => <View key={`h-${index}`} style={[styles.gridLineHorizontal, { top: `${index * 24}%` }]} />)}
          </View>
          <View style={styles.ciInfoRow}>
            {isLoading ? (
              <>
                <SkeletonBlock width={48} height={48} radius={24} />
                <SkeletonBlock width={120} height={14} radius={7} style={{ marginTop: 8 }} />
              </>
            ) : hasUsableSchedule ? (
              !isBluetoothOn ? (
                <>
                  <Bluetooth color="#64748B" size={42} opacity={0.3} />
                  <Text style={styles.ciNameLabel}>Bluetooth Off</Text>
                  <Text style={styles.ciSubLabel}>Turn on Bluetooth to scan</Text>
                </>
              ) : studentStatus === 'found' ? (
                <>
                  <PersonAvatar name={selectedAttendance?.instructorName ?? selectedOption?.instructorName ?? 'CI'} imageUrl={undefined} size={48} />
                  <Text style={styles.ciNameLabel} numberOfLines={1}>
                    {selectedAttendance?.instructorName ?? selectedOption?.instructorName ?? 'Assigned Instructor'}
                  </Text>
                  <Text style={styles.ciSubLabel}>Clinical Instructor</Text>
                </>
              ) : studentStatus === 'scanning' ? (
                <>
                  <ActivityIndicator color="#8A252C" size="large" />
                  <Text style={styles.ciNameLabel}>Searching...</Text>
                  <Text style={styles.ciSubLabel}>Scanning for Instructor signal</Text>
                </>
              ) : (
                <>
                  <Bluetooth color="#8A252C" size={42} opacity={0.3} />
                  <Text style={styles.ciNameLabel}>Signal Offline</Text>
                  <Text style={styles.ciSubLabel}>Ready to Scan</Text>
                </>
              )
            ) : null}
          </View>
        </View>
      )}

      <View style={[styles.infoCard, isSignalPanelHidden && { marginTop: 14 }]}>
        {isLoading ? (
          <View>
            <SkeletonBlock width="60%" height={18} radius={9} style={{ marginBottom: 10 }} />
            <SkeletonBlock width="90%" height={14} radius={7} style={{ marginBottom: 6 }} />
            <SkeletonBlock width="45%" height={14} radius={7} />
          </View>
        ) : (
          <>
            <Text style={styles.infoTitle}>{getStudentInfoTitle()}</Text>
            <Text style={styles.infoBody}>{getStudentInfoBody()}</Text>
            {studentStatus === 'found' && !isActiveSessionDisconnected && (
              <TouchableOpacity style={styles.connectButton} onPress={handleConnect} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.connectButtonText}>{needsTimeOut ? 'Connect and Time Out' : 'Connect and Time In'}</Text>}
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoHeaderRow}>
          <MapPin color="#8A252C" size={18} />
          <Text style={styles.infoKicker}>DUTY LOCATION</Text>
        </View>
        {isLoading ? <SkeletonBlock width="84%" height={22} radius={10} style={{ marginBottom: 12 }} /> : <Text style={styles.infoTitle}>{locationLabel}</Text>}
        {isLoading ? <SkeletonBlock width="76%" height={15} radius={7} /> : <Text style={styles.infoBody}>{hasUsableSchedule ? `${scheduleTime} - Instructor: ${selectedAttendance?.instructorName || selectedOption?.instructorName || 'Assigned Instructor'}` : 'Attendance will use your assigned schedule when available.'}</Text>}
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
  isLoading,
}: {
  options: AttendanceScheduleOption[];
  selectedScheduleId: number | null;
  onSelect: (scheduleId: number) => void;
  formatTime: (time?: string | null) => string;
  isLoading?: boolean;
}) => (
  <View style={styles.scheduleChooserCard}>
    <View style={styles.scheduleChooserHeader}>
      <Text style={styles.infoKicker}>CHOOSE DUTY SCHEDULE</Text>
      <View style={styles.scheduleCountPill}>
        {isLoading ? (
          <SkeletonBlock width={40} height={12} radius={6} style={{ opacity: 0.5 }} />
        ) : (
          <Text style={styles.scheduleCountText}>{options.length} today</Text>
        )}
      </View>
    </View>
    {isLoading ? (
      <View style={[styles.scheduleOptionCard, { borderLeftColor: '#E2E8F0', borderColor: '#EEF1F5' }]}>
        <View style={{ flex: 1 }}>
          <SkeletonBlock width="40%" height={14} radius={7} style={{ marginBottom: 6, opacity: 0.5 }} />
          <SkeletonBlock width="60%" height={12} radius={6} style={{ marginBottom: 6, opacity: 0.5 }} />
          <SkeletonBlock width="50%" height={10} radius={5} style={{ opacity: 0.5 }} />
        </View>
        <SkeletonBlock width={45} height={16} radius={8} style={{ opacity: 0.5 }} />
      </View>
    ) : (
      options.map((option) => {
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
      })
    )}
  </View>
);

const PersonAvatar = ({ name, imageUrl, size = 34 }: { name: string; imageUrl?: string; size?: number }) => {
  const radius = size / 2;
  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={{ width: size, height: size, borderRadius: radius, backgroundColor: '#E5E7EB' }} />;
  }

  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: '#FFCF01', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#111827', fontSize: size * 0.35, fontWeight: '900' }}>{initialsFor(name)}</Text>
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
  secondaryHeroButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryHeroButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
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
    minHeight: 160,
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
    gap: 10,
    paddingVertical: 18,
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
  ciInfoRow: {
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  ciNameLabel: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 220,
  },
  ciSubLabel: {
    color: '#8A252C',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  bluetoothStatusCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8DFEA',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 0,
  },
  bluetoothIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bluetoothActive: {
    backgroundColor: '#2563EB',
  },
  bluetoothInactive: {
    backgroundColor: '#E2E8F0',
  },
  bluetoothCardTitle: {
    color: '#030B1D',
    fontSize: 14,
    fontWeight: '900',
  },
  bluetoothCardStatus: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  bluetoothToggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bluetoothToggleBtnActive: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  bluetoothToggleBtnInactive: {
    backgroundColor: '#2563EB',
  },
  bluetoothToggleBtnText: {
    fontSize: 12,
    fontWeight: '900',
  },
  bluetoothToggleBtnTextActive: {
    color: '#475569',
  },
  bluetoothToggleBtnTextInactive: {
    color: '#FFFFFF',
  },
  studentStatusCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8DFEA',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
    flexDirection: 'row',
    gap: 10,
  },
  studentMetric: {
    flex: 1,
    minWidth: 84,
  },
  refreshButton: {
    position: 'absolute',
    top: 24,
    right: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 10,
  },
});
