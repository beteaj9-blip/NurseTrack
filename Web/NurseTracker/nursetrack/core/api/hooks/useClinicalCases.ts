import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';

export const useStudentCases = (studentId?: string) => {
  return useQuery({
    queryKey: ['clinical-cases', 'student', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data } = await apiClient.get(`/cases/student/${studentId}`);
      return data;
    },
    enabled: !!studentId,
  });
};

export const usePendingCases = (instructorId?: string) => {
  return useQuery({
    queryKey: ['clinical-cases', 'instructor', instructorId, 'pending'],
    queryFn: async () => {
      if (!instructorId) return [];
      // The new backend doesn't have a /pending filter, so we'll fetch all and filter client-side if needed, 
      // or assume the backend handles it. For now let's just fetch all instructor cases.
      const { data } = await apiClient.get(`/cases/instructor/${instructorId}`);
      return data;
    },
    enabled: !!instructorId,
  });
};

export const useSubmitCase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (caseData: any) => {
      const { data } = await apiClient.post('/cases', caseData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clinical-cases', 'student', data.studentId] });
    },
  });
};

export const useReviewCase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ caseId, status, remarks }: { caseId: string; status: string; remarks?: string }) => {
      const url = remarks 
        ? `/cases/${caseId}/validate?status=${status}&feedback=${encodeURIComponent(remarks)}`
        : `/cases/${caseId}/validate?status=${status}`;
      const { data } = await apiClient.put(url);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clinical-cases'] });
    },
  });
};
