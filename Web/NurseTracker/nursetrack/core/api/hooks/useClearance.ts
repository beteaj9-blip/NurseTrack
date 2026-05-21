import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';

function normalizeClearance(record: any) {
  return {
    ...record,
    studentId: record.studentId ?? record.student?.id,
    studentName: record.studentName ?? record.student?.fullName ?? '',
    studentSchoolId: record.studentSchoolId ?? record.student?.schoolId ?? '',
    studentSection: record.studentSection ?? record.student?.sectionInfo ?? '',
    studentAssignedLevels: record.studentAssignedLevels ?? record.student?.assignedLevels ?? [],
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

export const useClearanceSettings = () => useQuery({
  queryKey: ['clearance-settings'],
  queryFn: async () => {
    const { data } = await apiClient.get('/clearances/settings');
    return data;
  },
});

export const useUpdateClearanceSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data } = await apiClient.put('/clearances/settings', { enabled });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clearance-settings'] });
      queryClient.invalidateQueries({ queryKey: ['student-clearance'] });
    },
  });
};

export const useStudentClearance = (studentId?: string) => {
  return useQuery({
    queryKey: ['student-clearance', studentId],
    queryFn: async () => {
      const { data } = await apiClient.get('/clearances/student');
      return normalizeClearance(data);
    },
  });
};

export const useSubmitClearance = (studentId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/clearances/student/submit');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-clearance', studentId] });
      queryClient.invalidateQueries({ queryKey: ['clearances'] });
    },
  });
};

export const useUpdateClearanceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clearanceId, status }: { clearanceId: string; status: string }) => {
      const { data } = await apiClient.put(`/clearances/${clearanceId}/status`, null, { params: { status } });
      return normalizeClearance(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clearances'] });
      queryClient.invalidateQueries({ queryKey: ['student-clearance', data.studentId != null ? String(data.studentId) : undefined] });
    },
  });
};
