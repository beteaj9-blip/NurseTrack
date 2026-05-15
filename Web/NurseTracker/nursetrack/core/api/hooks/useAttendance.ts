import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';

export const useAttendance = (studentId?: string) => {
  return useQuery({
    queryKey: ['attendance', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data } = await apiClient.get(`/duties/student/${studentId}`);
      return data;
    },
    enabled: !!studentId,
  });
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dutyRecord: any) => {
      // Assuming check-in means time-in
      const { data } = await apiClient.post(`/duties/time-in`, dutyRecord);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.studentId] });
    },
  });
};

export const useVerifyAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (recordId: string) => {
      // By default setting status to VALIDATED or APPROVED. The new backend expects DutyStatus status.
      const { data } = await apiClient.put(`/duties/${recordId}/validate?status=VALIDATED`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', data.studentId] });
    },
  });
};
