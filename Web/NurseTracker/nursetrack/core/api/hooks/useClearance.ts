import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';

export const useStudentClearance = (studentId?: string) => {
  return useQuery({
    queryKey: ['student-clearance', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const { data } = await apiClient.get(`/clearances/student/${studentId}`);
      return data;
    },
    enabled: !!studentId,
  });
};

export const useSubmitClearance = (studentId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!studentId) throw new Error('Missing student id');
      const { data } = await apiClient.post(`/clearances/student/${studentId}/submit`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-clearance', studentId] });
    },
  });
};
