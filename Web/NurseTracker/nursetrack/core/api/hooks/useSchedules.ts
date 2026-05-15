import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';

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
    instructorId: schedule.instructorId ?? schedule.instructor?.id,
    date: schedule.date ?? schedule.shiftDate,
    area: schedule.area ?? schedule.ward,
    startTime: formatTime(schedule.startTime),
    endTime: formatTime(schedule.endTime),
  };
}

export const useSchedules = (studentId?: string) => {
  return useQuery({
    queryKey: ['schedules', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data } = await apiClient.get(`/schedules/student/${studentId}`);
      return data.map(normalizeSchedule);
    },
    enabled: !!studentId,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (scheduleData: any) => {
      const { data } = await apiClient.post('/schedules', scheduleData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['schedules', data.studentId] });
    },
  });
};
