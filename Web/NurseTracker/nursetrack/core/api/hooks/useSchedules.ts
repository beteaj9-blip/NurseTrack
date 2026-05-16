import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';
import { UserRole } from '@/core/types/user';

function formatTime(time?: string) {
  if (!time) return '';
  const [hours = '0', minutes = '00'] = time.split(':');
  const hourNumber = Number(hours);
  const period = hourNumber >= 12 ? 'PM' : 'AM';
  const displayHour = hourNumber % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
}

function normalizeSchedule(schedule: any) {
  return {
    ...schedule,
    studentId: schedule.studentId ?? schedule.student?.id,
    studentName: schedule.studentName ?? schedule.student?.fullName ?? '',
    studentSchoolId: schedule.studentSchoolId ?? schedule.student?.schoolId ?? '',
    studentSection: schedule.studentSection ?? schedule.student?.sectionInfo ?? '',
    instructorId: schedule.instructorId ?? schedule.instructor?.id,
    instructorName: schedule.instructorName ?? schedule.instructor?.fullName ?? '',
    date: schedule.date ?? schedule.shiftDate,
    area: schedule.area ?? schedule.ward,
    startTime: formatTime(schedule.startTime),
    endTime: formatTime(schedule.endTime),
  };
}

export const useSchedules = (userId?: string, role?: UserRole) => {
  return useQuery({
    queryKey: ['schedules', role ?? 'STUDENT', userId],
    queryFn: async () => {
      if (!userId && role !== 'ADMIN' && role !== 'CHAIR' && role !== 'COORDINATOR' && role !== 'ASSISTANT') return [];
      const endpoint = role === 'INSTRUCTOR'
        ? `/schedules/instructor/${userId}`
        : role === 'ADMIN' || role === 'CHAIR' || role === 'COORDINATOR' || role === 'ASSISTANT'
          ? '/schedules/all'
          : `/schedules/student/${userId}`;
      const { data } = await apiClient.get(endpoint);
      return data.map(normalizeSchedule);
    },
    enabled: !!userId || role === 'ADMIN' || role === 'CHAIR' || role === 'COORDINATOR' || role === 'ASSISTANT',
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (scheduleData: any) => {
      const { data } = await apiClient.post('/schedules', scheduleData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};
