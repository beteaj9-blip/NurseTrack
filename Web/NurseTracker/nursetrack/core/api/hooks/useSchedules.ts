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
    studentProfileImageUrl: schedule.studentProfileImageUrl ?? schedule.student?.profileImageUrl ?? '',
    instructorId: schedule.instructorId ?? schedule.instructor?.id,
    instructorName: schedule.instructorName ?? schedule.instructor?.fullName ?? '',
    instructorProfileImageUrl: schedule.instructorProfileImageUrl ?? schedule.instructor?.profileImageUrl ?? '',
    date: schedule.date ?? schedule.shiftDate,
    area: schedule.area ?? schedule.ward,
    rawStartTime: schedule.rawStartTime ?? schedule.startTime,
    rawEndTime: schedule.rawEndTime ?? schedule.endTime,
    startTime: formatTime(schedule.startTime),
    endTime: formatTime(schedule.endTime),
    canceled: schedule.canceled === true || schedule.canceled === 1 || schedule.canceled === '1' || String(schedule.canceled).toLowerCase() === 'true',
  };
}

export const useSchedules = (userId?: string, role?: UserRole) => {
  return useQuery({
    queryKey: ['schedules', role ?? 'STUDENT', userId],
    queryFn: async () => {
      const endpoint = role === 'INSTRUCTOR'
        ? '/schedules/instructor'
        : role === 'ADMIN' || role === 'CHAIR' || role === 'COORDINATOR' || role === 'ASSISTANT'
          ? '/schedules/all'
          : '/schedules/student';
      const { data } = await apiClient.get(endpoint);
      return data.map(normalizeSchedule);
    },
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

export const usePreviewScheduleImport = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post('/schedules/import/preview', formData);
      return data;
    },
  });
};

export const usePublishScheduleImport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (preview: any) => {
      const { data } = await apiClient.post('/schedules/import/publish', preview);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ scheduleId, schedule }: { scheduleId: string; schedule: any }) => {
      const { data } = await apiClient.put(`/schedules/${scheduleId}`, schedule);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (scheduleId: string) => {
      await apiClient.delete(`/schedules/${scheduleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};
