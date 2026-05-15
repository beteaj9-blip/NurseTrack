import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';

export const useSchedules = (studentId?: string) => {
  return useQuery({
    queryKey: ['schedules', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data } = await apiClient.get(`/schedules/student/${studentId}`);
      return data;
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
