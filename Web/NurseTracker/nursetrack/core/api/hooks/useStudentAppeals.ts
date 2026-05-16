import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';

function normalizeAppeal(appeal: any) {
  return {
    ...appeal,
    studentId: appeal.studentId ?? appeal.student?.id,
    instructorId: appeal.instructorId ?? appeal.instructor?.id,
    instructorName: appeal.instructor?.fullName ?? '',
    studentName: appeal.student?.fullName ?? '',
    schoolId: appeal.student?.schoolId ?? '',
    sectionInfo: appeal.student?.sectionInfo ?? '',
  };
}

export const useStudentAppeals = (studentId?: string) => {
  return useQuery({
    queryKey: ['student-appeals', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data } = await apiClient.get(`/appeals/student/${studentId}`);
      return data.map(normalizeAppeal);
    },
    enabled: !!studentId,
  });
};

export const useStudentAppeal = (appealId?: string) => {
  return useQuery({
    queryKey: ['student-appeal', appealId],
    queryFn: async () => {
      if (!appealId) return null;
      const { data } = await apiClient.get(`/appeals/${appealId}`);
      return normalizeAppeal(data);
    },
    enabled: !!appealId,
  });
};

export const useAppealTypes = () => {
  return useQuery({
    queryKey: ['appeal-types'],
    queryFn: async () => {
      const { data } = await apiClient.get('/appeals/types');
      return data;
    },
  });
};

export const useCreateStudentAppeal = (studentId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appeal: any) => {
      const { data } = await apiClient.post('/appeals', appeal);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-appeals', studentId] });
    },
  });
};

export const useUpdateStudentAppeal = (studentId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ appealId, appeal }: { appealId: string; appeal: any }) => {
      const { data } = await apiClient.put(`/appeals/${appealId}`, appeal);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-appeals', studentId] });
      queryClient.invalidateQueries({ queryKey: ['student-appeal', variables.appealId] });
    },
  });
};

export const useUploadAppealFile = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post('/uploads/cloudinary', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
  });
};
