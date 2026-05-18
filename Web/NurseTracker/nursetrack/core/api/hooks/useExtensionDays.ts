import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';

function normalizeExtensionDay(record: any) {
  return {
    ...record,
    studentId: record.studentId ?? record.student?.id,
    studentName: record.studentName ?? record.student?.fullName ?? '',
    studentSchoolId: record.studentSchoolId ?? record.student?.schoolId ?? '',
    studentSection: record.studentSection ?? record.student?.sectionInfo ?? '',
    studentProfileImageUrl: record.studentProfileImageUrl ?? record.student?.profileImageUrl ?? '',
    instructorId: record.instructorId ?? record.instructor?.id,
    instructorName: record.instructorName ?? record.instructor?.fullName ?? '',
  };
}

export const useInstructorExtensionDays = (instructorId?: string, studentId?: string) => useQuery({
  queryKey: ['extension-days', 'instructor', instructorId, studentId],
  queryFn: async () => {
    const { data } = await apiClient.get('/extension-days/instructor');
    return data.map(normalizeExtensionDay);
  },
});

export const useStudentExtensionDays = (studentId?: string) => useQuery({
  queryKey: ['extension-days', 'student', studentId],
  queryFn: async () => {
    const { data } = await apiClient.get('/extension-days/student');
    return data.map(normalizeExtensionDay);
  },
});

export const useAllExtensionDays = (studentId?: string, enabled = true, viewerId?: string) => useQuery({
  queryKey: ['extension-days', 'all', studentId, viewerId],
  queryFn: async () => {
    const { data } = await apiClient.get('/extension-days', { params: { ...(studentId ? { studentId } : {}), ...(viewerId ? { viewerId } : {}) } });
    return data.map(normalizeExtensionDay);
  },
  enabled,
});

export const useCreateExtensionDay = (instructorId?: string, studentId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => (await apiClient.post('/extension-days', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extension-days'] });
      queryClient.invalidateQueries({ queryKey: ['extension-days', 'instructor', instructorId, studentId] });
      queryClient.invalidateQueries({ queryKey: ['extension-days', 'instructor', instructorId] });
    },
  });
};

export const useUpdateExtensionDay = (instructorId?: string, studentId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => (await apiClient.put(`/extension-days/${id}`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extension-days'] });
      queryClient.invalidateQueries({ queryKey: ['extension-days', 'instructor', instructorId, studentId] });
      queryClient.invalidateQueries({ queryKey: ['extension-days', 'instructor', instructorId] });
    },
  });
};

export const useCancelExtensionDay = (instructorId?: string, studentId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await apiClient.put(`/extension-days/${id}/cancel`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extension-days'] });
      queryClient.invalidateQueries({ queryKey: ['extension-days', 'instructor', instructorId, studentId] });
      queryClient.invalidateQueries({ queryKey: ['extension-days', 'instructor', instructorId] });
    },
  });
};
