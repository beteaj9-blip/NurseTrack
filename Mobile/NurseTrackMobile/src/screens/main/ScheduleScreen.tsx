import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Clock, List, MapPin, Users } from 'lucide-react-native';
import { api } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { SkeletonBlock } from '../../components/Skeleton';
import { SlideUpView } from '../../components/SlideUpView';

interface ScheduleUser {
  id: number;
  fullName: string;
  role?: string;
  schoolId?: string;
  sectionInfo?: string;
  groupInfo?: string;
  profileImageUrl?: string;
}

interface ScheduleData {
  id: number;
  hospital: string;
  ward: string;
  area?: string;
  date?: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  rawStartTime?: string;
  rawEndTime?: string;
  groupName?: string;
  group?: string;
  student?: ScheduleUser;
  instructor?: ScheduleUser;
  studentId?: number;
  studentName?: string;
  studentSchoolId?: string;
  studentSection?: string;
  instructorId?: number;
  instructorName?: string;
  canceled: boolean;
}

interface AssignedStudent {
  id: number;
  name: string;
  schoolId: string;
  section: string;
  profileImageUrl?: string;
}

const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const parseDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const dateOnly = dateStr.split('T')[0].split(' ')[0];
  const parts = dateOnly.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
};

const formatMonthYear = (date: Date) => {
  return `${monthsShort[date.getMonth()]} ${date.getFullYear()}`;
};

const formatFullDate = (date: Date) => {
  return `${daysShort[date.getDay()]}, ${monthsShort[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const formatMonthShort = (date: Date) => {
  return monthsShort[date.getMonth()].toUpperCase();
};

const toDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const getScheduleEndpoint = (role?: string) => {
  if (role === 'STUDENT') return '/schedules/student';
  if (role === 'INSTRUCTOR') return '/schedules/instructor';
  return '/schedules/all';
};

const normalizeSchedule = (schedule: ScheduleData): ScheduleData => ({
  ...schedule,
  hospital: schedule.hospital ?? '',
  ward: schedule.ward ?? schedule.area ?? '',
  shiftDate: schedule.shiftDate ?? schedule.date ?? '',
  startTime: schedule.rawStartTime ?? schedule.startTime,
  endTime: schedule.rawEndTime ?? schedule.endTime,
  studentId: schedule.studentId ?? schedule.student?.id,
  studentName: schedule.studentName ?? schedule.student?.fullName,
  studentSchoolId: schedule.studentSchoolId ?? schedule.student?.schoolId,
  studentSection: schedule.studentSection ?? schedule.student?.sectionInfo,
  instructorId: schedule.instructorId ?? schedule.instructor?.id,
  instructorName: schedule.instructorName ?? schedule.instructor?.fullName,
  canceled: schedule.canceled === true,
});

const scheduleSessionKey = (schedule: ScheduleData) => [
  schedule.shiftDate,
  schedule.instructor?.id ?? schedule.instructorId ?? 'instructor',
  schedule.hospital,
  schedule.ward,
  schedule.startTime,
  schedule.endTime,
  schedule.student?.sectionInfo ?? schedule.studentSection ?? schedule.groupName ?? schedule.group ?? 'section',
].join('|');

const getStudentFromSchedule = (schedule: ScheduleData, currentUser?: ScheduleUser | null, role?: string): AssignedStudent | null => {
  const canUseCurrentUser = role === 'STUDENT';
  if (schedule.student?.role && schedule.student.role !== 'STUDENT') return null;
  if ((schedule.student?.id ?? schedule.studentId) && (schedule.student?.id ?? schedule.studentId) === (schedule.instructor?.id ?? schedule.instructorId)) return null;
  const id = schedule.student?.id ?? schedule.studentId ?? (canUseCurrentUser ? currentUser?.id : undefined);
  const name = schedule.student?.fullName ?? schedule.studentName ?? (canUseCurrentUser ? currentUser?.fullName : undefined);
  if (!id || !name) return null;

  return {
    id,
    name,
    schoolId: schedule.student?.schoolId ?? schedule.studentSchoolId ?? (canUseCurrentUser ? currentUser?.schoolId : undefined) ?? 'N/A',
    section: schedule.student?.sectionInfo ?? schedule.studentSection ?? (canUseCurrentUser ? currentUser?.sectionInfo : undefined) ?? 'N/A',
    profileImageUrl: schedule.student?.profileImageUrl ?? (canUseCurrentUser ? currentUser?.profileImageUrl : undefined),
  };
};

const initialsFor = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'NA';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'NA';
};

export const ScheduleScreen = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleData | null>(null);
  const [selectedDateSchedules, setSelectedDateSchedules] = useState<ScheduleData[] | null>(null);
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    void fetchSchedules();
  }, [user?.role]);

  const fetchSchedules = async () => {
    setIsLoading(true);
    setIsRefreshing(true);

    try {
      const response = await api.get<ScheduleData[]>(getScheduleEndpoint(user?.role));
      setSchedules(response.data.map(normalizeSchedule));
    } catch (e) {
      console.log('Failed to fetch schedules from backend', e);
      setSchedules([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const displaySchedules = useMemo(() => {
    const sessions = new Map<string, ScheduleData>();
    schedules.forEach((schedule) => {
      const key = scheduleSessionKey(schedule);
      if (!sessions.has(key)) sessions.set(key, schedule);
    });
    return Array.from(sessions.values());
  }, [schedules]);

  const selectedRoster = useMemo(() => {
    if (!selectedSchedule) return [];
    const roster = schedules
      .filter((schedule) => scheduleSessionKey(schedule) === scheduleSessionKey(selectedSchedule))
      .map((schedule) => getStudentFromSchedule(schedule, user, user?.role))
      .filter((student): student is AssignedStudent => Boolean(student));
    return Array.from(new Map(roster.map((student) => [student.id, student])).values());
  }, [schedules, selectedSchedule, user]);

  const monthSchedules = useMemo(() => {
    const map = new Map<string, ScheduleData[]>();
    displaySchedules.forEach((schedule) => {
      const existing = map.get(schedule.shiftDate) ?? [];
      map.set(schedule.shiftDate, [...existing, schedule]);
    });
    return map;
  }, [displaySchedules]);

  const listViewSchedules = useMemo(() => {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    return displaySchedules
      .filter((schedule) => {
        const d = parseDate(schedule.shiftDate);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .sort((a, b) => a.shiftDate.localeCompare(b.shiftDate));
  }, [displaySchedules, displayedMonth]);

  const calendarCells = useMemo(() => {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();
    const cells: Array<{ day: number; key: string; schedules: ScheduleData[]; isCurrentMonth: boolean; isToday: boolean }> = [];
    const todayKey = toDateKey(new Date());

    for (let i = 0; i < firstDay; i += 1) {
      const day = previousMonthDays - firstDay + i + 1;
      const key = toDateKey(new Date(year, month - 1, day));
      cells.push({ day, key, schedules: monthSchedules.get(key) ?? [], isCurrentMonth: false, isToday: key === todayKey });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const key = toDateKey(new Date(year, month, day));
      cells.push({ day, key, schedules: monthSchedules.get(key) ?? [], isCurrentMonth: true, isToday: key === todayKey });
    }

    while (cells.length % 7 !== 0 || cells.length < 42) {
      const day = cells.length - firstDay - daysInMonth + 1;
      const key = toDateKey(new Date(year, month + 1, day));
      cells.push({ day, key, schedules: monthSchedules.get(key) ?? [], isCurrentMonth: false, isToday: key === todayKey });
    }

    return cells;
  }, [displayedMonth, monthSchedules]);

  const calendarWeeks = useMemo(() => {
    const weeks: typeof calendarCells[] = [];
    for (let index = 0; index < calendarCells.length; index += 7) {
      weeks.push(calendarCells.slice(index, index + 7));
    }
    return weeks;
  }, [calendarCells]);

  const goToPreviousMonth = () => {
    setDisplayedMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setDisplayedMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const goToThisMonth = () => {
    const today = new Date();
    setDisplayedMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const isDisplayingCurrentMonth = () => {
    const today = new Date();
    return displayedMonth.getFullYear() === today.getFullYear() && displayedMonth.getMonth() === today.getMonth();
  };

  const monthButtonLabel = () => isDisplayingCurrentMonth()
    ? 'This Month'
    : formatMonthYear(displayedMonth);

  const formatDate = (dateStr: string) => {
    try {
      return formatFullDate(parseDate(dateStr));
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
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

  const selectedGroup = selectedSchedule?.groupName || selectedSchedule?.group || selectedRoster[0]?.section || 'Assigned Group';
  const selectedInstructorName = selectedSchedule?.instructor?.fullName || selectedSchedule?.instructorName || 'Clinical Instructor';
  const selectedInstructorImage = selectedSchedule?.instructor?.profileImageUrl || (user?.role !== 'STUDENT' ? user?.profileImageUrl : undefined);

  const openScheduleCell = (cellSchedules: ScheduleData[]) => {
    if (cellSchedules.length === 0) return;
    setSelectedDateSchedules(cellSchedules.length > 1 ? cellSchedules : null);
    setSelectedSchedule(cellSchedules.find((schedule) => !schedule.canceled) ?? cellSchedules[0]);
  };

  if (selectedSchedule) {
    const hasScheduleChoices = selectedDateSchedules && selectedDateSchedules.length > 1;
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.detailTitleRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => {
            setSelectedSchedule(null);
            setSelectedDateSchedules(null);
          }}>
            <ArrowLeft color="#344054" size={18} />
          </TouchableOpacity>
          <View>
            <Text style={styles.kicker}>ASSIGNED SCHEDULES</Text>
            <Text style={styles.pageTitle}>{hasScheduleChoices ? 'Choose Schedule' : 'Assigned Roster'}</Text>
          </View>
        </View>

        {hasScheduleChoices && (
          <View style={styles.multiSchedulePanelInline}>
            <View style={styles.multiHeaderRow}>
              <Text style={styles.multiDateText}>{formatDate(selectedSchedule.shiftDate)}</Text>
              <View style={styles.activeStudentPill}>
                <Text style={styles.activeStudentPillText}>{selectedDateSchedules.length} schedule(s)</Text>
              </View>
            </View>

            {selectedDateSchedules.map((schedule) => {
              const isSelected = scheduleSessionKey(schedule) === scheduleSessionKey(selectedSchedule);
              return (
                <TouchableOpacity
                  key={schedule.id}
                  style={[styles.multiScheduleCard, isSelected && styles.multiScheduleCardSelected]}
                  onPress={() => setSelectedSchedule(schedule)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.multiScheduleTitle}>{schedule.canceled ? 'Canceled' : `${schedule.ward} Duty`}</Text>
                  <Text style={styles.multiScheduleHospital}>{schedule.hospital}</Text>
                  <Text style={styles.multiScheduleMeta}>{schedule.ward} - {formatTime(schedule.startTime)} to {formatTime(schedule.endTime)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={[styles.studentRosterCard, selectedSchedule.canceled && styles.studentRosterCardCanceled]}>
          <View style={styles.rosterTopRow}>
            <Text style={styles.rosterHeading}>CLINICAL DUTY</Text>
            <View style={selectedSchedule.canceled ? styles.canceledPill : styles.completedPill}>
              <Text style={selectedSchedule.canceled ? styles.canceledPillText : styles.completedPillText}>{selectedSchedule.canceled ? 'Cancelled' : 'Assigned'}</Text>
            </View>
          </View>
          <Text style={styles.rosterDate}>{formatDate(selectedSchedule.shiftDate)}</Text>

          <InfoBox label="HOSPITAL" value={selectedSchedule.hospital} />
          <InfoBox label="AREA OF ASSIGNMENT" value={selectedSchedule.ward} />
          <InfoBox label="SHIFT TIME" value={`${formatTime(selectedSchedule.startTime)} - ${formatTime(selectedSchedule.endTime)}`} />
          <InfoBox label="ASSIGNED GROUP" value={selectedGroup} />
        </View>

        <View style={[styles.rosterCard, selectedSchedule.canceled && styles.rosterCardCanceled]}>
          <View style={styles.rosterHeaderRow}>
            <Text style={styles.rosterSectionTitle}>Assigned Student(s)</Text>
            <View style={[styles.activeStudentPill, selectedSchedule.canceled && styles.activeStudentPillCanceled]}>
              <Text style={[styles.activeStudentPillText, selectedSchedule.canceled && styles.activeStudentPillTextCanceled]}>{selectedRoster.length} {selectedSchedule.canceled ? 'assigned' : 'active'} student(s)</Text>
            </View>
          </View>

          <View style={[styles.instructorRow, selectedSchedule.canceled && styles.instructorRowCanceled]}>
            <StudentAvatar name={selectedInstructorName} imageUrl={selectedInstructorImage} size={40} />
            <View style={{ flex: 1 }}>
              <Text style={styles.instructorName}>{selectedInstructorName}</Text>
              <Text style={styles.instructorSubtext}>Clinical Instructor handling this schedule</Text>
            </View>
          </View>

          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderText, { width: 34 }]}>NO.</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>STUDENT</Text>
            <Text style={[styles.tableHeaderText, { width: 72 }]}>SECTION</Text>
          </View>

          <View style={styles.studentListBox}>
            {selectedRoster.length === 0 ? (
              <Text style={styles.emptyRosterText}>No assigned students found for this schedule.</Text>
            ) : selectedRoster.map((student, index) => (
              <View key={student.id} style={styles.studentRow}>
                <Text style={styles.rowNumber}>{index + 1}.</Text>
                <StudentAvatar name={student.name} imageUrl={student.profileImageUrl} size={28} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentMeta}>{student.schoolId}</Text>
                </View>
                <Text style={styles.studentSectionText}>{student.section}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <SlideUpView delay={0} duration={480}>
        <View style={styles.screenTitleRow}>
          <View>
            <Text style={styles.kicker}>ASSIGNED SCHEDULES</Text>
            <Text style={styles.pageTitle}>Assigned Schedules</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchSchedules} disabled={isRefreshing}>
            {isRefreshing ? <ActivityIndicator size="small" color="#8A252C" /> : <Text style={styles.refreshText}>Refresh</Text>}
          </TouchableOpacity>
        </View>
      </SlideUpView>

      <SlideUpView delay={120} duration={520}>
        <View style={styles.calendarShell}>
          <View style={styles.calendarHeaderRow}>
          <Text style={styles.sectionTitle}>Schedule Calendar and List</Text>
          <View style={styles.modeToggleGroup}>
            <TouchableOpacity style={[styles.modeToggle, viewMode === 'calendar' && styles.modeToggleActive]} onPress={() => setViewMode('calendar')}>
              <CalendarDays color={viewMode === 'calendar' ? '#FFFFFF' : '#344054'} size={13} />
              <Text style={[styles.modeToggleText, viewMode === 'calendar' && styles.modeToggleTextActive]}>Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modeToggle, viewMode === 'list' && styles.modeToggleActive]} onPress={() => setViewMode('list')}>
              <List color={viewMode === 'list' ? '#FFFFFF' : '#344054'} size={13} />
              <Text style={[styles.modeToggleText, viewMode === 'list' && styles.modeToggleTextActive]}>List</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.monthControlsCard}>
          <TouchableOpacity 
            style={[styles.monthNavButton, (isLoading || isRefreshing) && { opacity: 0.5 }]} 
            onPress={goToPreviousMonth}
            disabled={isLoading || isRefreshing}
          >
            <ChevronLeft color="#344054" size={18} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.thisMonthButton, (isLoading || isRefreshing) && { opacity: 0.5 }]} 
            onPress={goToThisMonth}
            disabled={isLoading || isRefreshing}
          >
            <Text style={styles.thisMonthText}>{monthButtonLabel()}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.monthNavButton, (isLoading || isRefreshing) && { opacity: 0.5 }]} 
            onPress={goToNextMonth}
            disabled={isLoading || isRefreshing}
          >
            <ChevronRight color="#344054" size={18} />
          </TouchableOpacity>
        </View>

        {viewMode === 'calendar' ? (
          <View>
            <View style={styles.calendarGrid}>
              <View style={styles.weekRow}>
                {weekDays.map((day) => (
                  <View key={day} style={styles.weekDayCell}>
                    <Text style={styles.weekDayText}>{day}</Text>
                  </View>
                ))}
              </View>

              {calendarWeeks.map((week, weekIndex) => (
                <View key={`week-${weekIndex}`} style={styles.weekRow}>
                  {week.map((cell) => {
                    const hasMultipleSchedules = cell.schedules.length > 1;
                    const hasCanceledSchedules = cell.schedules.some((schedule) => schedule.canceled);
                    const allSchedulesCanceled = cell.schedules.length > 0 && cell.schedules.every((schedule) => schedule.canceled);
                    const hasMixedCanceledSchedules = hasMultipleSchedules && hasCanceledSchedules && !allSchedulesCanceled;
                    const primarySchedule = cell.schedules.find((schedule) => !schedule.canceled) ?? cell.schedules[0];
                    return (
                      <TouchableOpacity
                        key={cell.key}
                        style={[
                          styles.dayCell,
                          !cell.isCurrentMonth && styles.dayCellOutside,
                          !isLoading && primarySchedule && !allSchedulesCanceled && styles.dayCellAssigned,
                          !isLoading && hasMultipleSchedules && !allSchedulesCanceled && styles.dayCellMultiple,
                          !isLoading && hasMixedCanceledSchedules && styles.dayCellMixedCanceled,
                          !isLoading && allSchedulesCanceled && styles.dayCellCanceled,
                          cell.isToday && (!primarySchedule || isLoading) && styles.dayCellToday,
                        ]}
                        onPress={() => openScheduleCell(cell.schedules)}
                        disabled={isLoading || isRefreshing || !primarySchedule}
                        activeOpacity={0.82}
                      >
                      {!isLoading && hasMixedCanceledSchedules && (
                        <LinearGradient
                          colors={['#FFF8D7', '#FFF0B3', '#F5D9DD']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.dayCellMixedGradient}
                          pointerEvents="none"
                        />
                      )}
                      {!isLoading && (
                        <Text style={[
                          styles.dayNumber,
                          !cell.isCurrentMonth && styles.dayNumberOutside,
                          !isLoading && primarySchedule && !allSchedulesCanceled && styles.dayNumberDuty,
                          !isLoading && allSchedulesCanceled && styles.dayNumberCanceled,
                          cell.isToday && styles.dayNumberToday,
                        ]}>{cell.day}</Text>
                      )}
                        {isLoading ? (
                          (cell.day % 4 === 0 || cell.day % 7 === 0) ? (
                            <>
                              <SkeletonBlock width="74%" height={8} radius={4} style={styles.calendarCellSkeletonLine} />
                              <SkeletonBlock width="56%" height={8} radius={4} style={styles.calendarCellSkeletonLine} />
                            </>
                          ) : null
                        ) : primarySchedule ? allSchedulesCanceled ? (
                          <>
                            <Text style={styles.canceledTitle} numberOfLines={1}>Canceled</Text>
                            <Text style={styles.noActiveText} numberOfLines={1}>No active</Text>
                          </>
                        ) : hasMultipleSchedules ? (
                          <>
                            <Text style={styles.multipleCountText}>{cell.schedules.length}</Text>
                            <Text style={styles.multipleDutyText} numberOfLines={1}>Multiple Duties</Text>
                          </>
                        ) : (
                          <>
                            <Text style={styles.assignmentArea} numberOfLines={1}>{primarySchedule.ward}</Text>
                            <Text style={styles.assignmentText} numberOfLines={1}>{primarySchedule.hospital}</Text>
                          </>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View style={styles.dutyDot} />
                <Text style={styles.legendText}>Duty day</Text>
              </View>
              <View style={styles.legendItem}>
                <LinearGradient
                  colors={['#FFCF01', '#8A252C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.mixedDot}
                />
                <Text style={styles.legendText}>Mixed</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.canceledDot} />
                <Text style={styles.legendText}>Canceled</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.todayDot} />
                <Text style={styles.legendText}>Today</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.listPanel}>
            {isLoading ? (
              <View>
                {Array.from({ length: 5 }).map((_, index) => (
                  <View key={`schedule-list-skeleton-${index}`} style={styles.scheduleListRow}>
                    <SkeletonBlock width={48} height={56} radius={12} />
                    <View style={{ flex: 1 }}>
                      <SkeletonBlock width="64%" height={14} radius={7} />
                      <SkeletonBlock width="78%" height={11} radius={6} style={styles.listSkeletonLine} />
                      <SkeletonBlock width="52%" height={11} radius={6} style={styles.listSkeletonLine} />
                    </View>
                    <SkeletonBlock width={42} height={12} radius={6} />
                  </View>
                ))}
              </View>
            ) : listViewSchedules.length === 0 ? (
              <View style={styles.emptyCard}>
                <Users color="#667085" size={28} style={{ marginBottom: 10 }} />
                <Text style={styles.emptyText}>No schedules for this month.</Text>
              </View>
            ) : (
              listViewSchedules.map((schedule) => (
                <TouchableOpacity key={schedule.id} style={[styles.scheduleListRow, schedule.canceled && styles.scheduleListRowCanceled]} onPress={() => setSelectedSchedule(schedule)} activeOpacity={0.82}>
                  <View style={styles.listDateBox}>
                    <Text style={styles.listDateMonth}>{formatMonthShort(parseDate(schedule.shiftDate))}</Text>
                    <Text style={styles.listDateDay}>{parseDate(schedule.shiftDate).getDate()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listTitle}>{schedule.canceled ? 'Canceled' : schedule.ward}</Text>
                    <View style={styles.listMetaRow}>
                      <MapPin color="#667085" size={13} />
                      <Text style={styles.listMetaText}>{schedule.hospital}</Text>
                    </View>
                    <View style={styles.listMetaRow}>
                      <Clock color="#667085" size={13} />
                      <Text style={styles.listMetaText}>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</Text>
                    </View>
                  </View>
                  <Text style={styles.viewRosterText}>Roster</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>
      </SlideUpView>
    </ScrollView>
  );
};

const InfoBox = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoBox}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
  </View>
);

const StudentAvatar = ({ name, imageUrl, size = 28 }: { name: string; imageUrl?: string; size?: number }) => {
  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={[styles.studentAvatarImage, { width: size, height: size, borderRadius: size / 2 }]} />;
  }

  return (
    <View style={[styles.studentAvatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.studentAvatarFallbackText}>{initialsFor(name)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  kicker: {
    color: '#8A252C',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  pageTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '900',
  },
  refreshButton: {
    minWidth: 76,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshText: {
    color: '#344054',
    fontSize: 12,
    fontWeight: '800',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  calendarShell: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7DCE5',
    padding: 12,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '900',
    flex: 1,
    lineHeight: 21,
  },
  modeToggleGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  modeToggle: {
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
  },
  modeToggleActive: {
    backgroundColor: '#8A252C',
    borderColor: '#8A252C',
  },
  modeToggleText: {
    color: '#344054',
    fontSize: 12,
    fontWeight: '900',
  },
  modeToggleTextActive: {
    color: '#FFFFFF',
  },
  monthControlsCard: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
    backgroundColor: '#FFF8D7',
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  monthNavButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thisMonthButton: {
    minWidth: 112,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thisMonthText: {
    color: '#344054',
    fontSize: 13,
    fontWeight: '900',
  },
  calendarGrid: {
    gap: 4,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 4,
  },
  weekDayCell: {
    flex: 1,
    minWidth: 0,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  weekDayText: {
    color: '#111827',
    fontSize: 9,
    fontWeight: '900',
  },
  dayCell: {
    flex: 1,
    minWidth: 0,
    height: 66,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
    padding: 4,
    overflow: 'hidden',
  },
  dayCellOutside: {
    opacity: 0.48,
  },
  dayCellAssigned: {
    borderColor: '#FFCF01',
    borderWidth: 1.5,
    borderLeftWidth: 4,
    borderLeftColor: '#FFCF01',
    backgroundColor: '#FFF8D7',
  },
  dayCellMultiple: {
    borderColor: '#FFCF01',
    borderWidth: 2,
    borderLeftWidth: 5,
    backgroundColor: '#FFF7C7',
  },
  dayCellMixedCanceled: {
    borderColor: '#D89B16',
    borderLeftColor: '#8A252C',
    backgroundColor: '#FFF0B3',
  },
  dayCellMixedGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
  },
  dayCellCanceled: {
    borderColor: '#FCA5A5',
    borderWidth: 1.5,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  dayCellToday: {
    borderColor: '#8A252C',
    borderWidth: 2,
  },
  dayNumber: {
    color: '#111827',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 8,
    width: 22,
    height: 22,
    borderRadius: 8,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 22,
  },
  dayNumberDuty: {
    backgroundColor: '#F8E8B5',
    color: '#8A252C',
  },
  dayNumberCanceled: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  dayNumberOutside: {
    color: '#98A2B3',
  },
  dayNumberToday: {
    backgroundColor: '#8A252C',
    color: '#FFFFFF',
  },
  assignmentArea: {
    color: '#111827',
    fontSize: 8,
    fontWeight: '900',
    marginBottom: 2,
  },
  assignmentText: {
    color: '#8A252C',
    fontSize: 8,
    fontWeight: '900',
  },
  multipleCountText: {
    color: '#111827',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 3,
  },
  multipleDutyText: {
    color: '#344054',
    fontSize: 8,
    fontWeight: '900',
    marginBottom: 3,
  },
  calendarCellSkeletonLine: {
    marginTop: 7,
  },
  todayPillText: {
    alignSelf: 'flex-start',
    color: '#8A252C',
    fontSize: 7,
    fontWeight: '900',
    backgroundColor: '#FFFFFF',
    borderRadius: 99,
    paddingHorizontal: 5,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  canceledTitle: {
    color: '#111827',
    fontSize: 8,
    fontWeight: '900',
    marginBottom: 2,
  },
  noActiveText: {
    color: '#475467',
    fontSize: 7,
    lineHeight: 9,
    fontWeight: '900',
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dutyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFCF01',
  },
  mixedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  canceledDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  todayDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8A252C',
  },
  legendText: {
    color: '#344054',
    fontSize: 11,
    fontWeight: '900',
  },
  listPanel: {
    gap: 10,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 12,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyRosterText: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '800',
    paddingVertical: 18,
    paddingHorizontal: 12,
    lineHeight: 19,
  },
  scheduleListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  scheduleListRowCanceled: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  listSkeletonLine: {
    marginTop: 8,
  },
  listDateBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#8A252C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listDateMonth: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  listDateDay: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  listTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 5,
  },
  listMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  listMetaText: {
    color: '#667085',
    fontSize: 11,
    fontWeight: '700',
  },
  viewRosterText: {
    color: '#8A252C',
    fontSize: 11,
    fontWeight: '900',
  },
  multiSchedulePanel: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFF8D7',
    padding: 14,
  },
  multiSchedulePanelInline: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFF8D7',
    padding: 14,
    marginBottom: 14,
  },
  multiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  multiDateText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
    flex: 1,
  },
  multiScheduleCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: '#D7DCE5',
    borderLeftColor: '#FFCF01',
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginBottom: 10,
  },
  multiScheduleCardSelected: {
    borderColor: '#8A252C',
    borderLeftColor: '#8A252C',
  },
  multiScheduleTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 8,
  },
  multiScheduleHospital: {
    color: '#536B95',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },
  multiScheduleMeta: {
    color: '#536B95',
    fontSize: 12,
    fontWeight: '800',
  },
  rosterCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFCF01',
    padding: 16,
    marginBottom: 14,
  },
  studentRosterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7DCE5',
    padding: 16,
    marginBottom: 14,
  },
  studentRosterCardCanceled: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  rosterCardCanceled: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  instructorRowCanceled: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  activeStudentPillCanceled: {
    backgroundColor: '#FEE2E2',
  },
  activeStudentPillTextCanceled: {
    color: '#991B1B',
  },
  rosterTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rosterHeading: {
    color: '#8A252C',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  rosterDate: {
    color: '#344054',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 14,
  },
  completedPill: {
    minHeight: 30,
    paddingHorizontal: 14,
    borderRadius: 99,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedPillText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '900',
  },
  canceledPill: {
    minHeight: 30,
    paddingHorizontal: 14,
    borderRadius: 99,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canceledPillText: {
    color: '#991B1B',
    fontSize: 11,
    fontWeight: '900',
  },
  infoBox: {
    minHeight: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  infoLabel: {
    color: '#8A252C',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  infoValue: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
  },
  rosterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rosterSectionTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
  },
  activeStudentPill: {
    minHeight: 30,
    paddingHorizontal: 12,
    borderRadius: 99,
    backgroundColor: '#FFF2C2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStudentPillText: {
    color: '#8A252C',
    fontSize: 11,
    fontWeight: '900',
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FFCF01',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFFBEB',
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(138, 37, 44, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructorName: {
    color: '#111827',
    fontSize: 11,
    fontWeight: '900',
  },
  instructorSubtext: {
    color: '#344054',
    fontSize: 9,
    fontWeight: '700',
  },
  statusPill: {
    width: 24,
    height: 10,
    borderRadius: 99,
    backgroundColor: '#D9D9D9',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 10,
    minHeight: 42,
    backgroundColor: '#FFFFFF',
  },
  tableHeaderText: {
    color: '#111827',
    fontSize: 10,
    fontWeight: '900',
  },
  studentListBox: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#D7DCE5',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 54,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
    backgroundColor: '#FFFFFF',
  },
  rowNumber: {
    color: '#111827',
    fontSize: 10,
    fontWeight: '900',
    width: 24,
  },
  studentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentAvatarText: {
    color: '#8A252C',
    fontSize: 9,
    fontWeight: '900',
  },
  studentAvatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
  },
  studentAvatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFCF01',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentAvatarFallbackText: {
    color: '#111827',
    fontSize: 10,
    fontWeight: '900',
  },
  studentName: {
    color: '#111827',
    fontSize: 11,
    fontWeight: '900',
  },
  studentMeta: {
    color: '#667085',
    fontSize: 9,
    fontWeight: '700',
  },
  studentSectionText: {
    width: 72,
    color: '#536B95',
    fontSize: 11,
    fontWeight: '900',
  },
});
