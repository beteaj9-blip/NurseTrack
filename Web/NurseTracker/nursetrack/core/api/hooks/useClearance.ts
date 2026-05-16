import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';

function normalizeClearance(record: any) {
  return {
    ...record,
    studentId: record.studentId ?? record.student?.id,
    studentName: record.studentName ?? record.student?.fullName ?? '',
    studentSchoolId: record.studentSchoolId ?? record.student?.schoolId ?? '',
    studentSection: record.studentSection ?? record.student?.sectionInfo ?? '',
    studentProfileImageUrl: record.studentProfileImageUrl ?? record.student?.profileImageUrl ?? '',
  };
}

export const useClearances = () => useQuery({
  queryKey: ['clearances'],
  queryFn: async () => {
    const { data } = await apiClient.get('/clearances');
    return data.map(normalizeClearance);
  },
});

export const useStudentClearance = (studentId?: string) => {
  return useQuery({
    queryKey: ['student-clearance', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const { data } = await apiClient.get(`/clearances/student/${studentId}`);
      return normalizeClearance(data);
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
