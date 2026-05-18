import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';

function normalizeAppeal(appeal: any) {
  return {
    ...appeal,
    studentId: appeal.studentId ?? appeal.student?.id,
    instructorId: appeal.instructorId ?? appeal.instructor?.id,
    instructorName: appeal.instructor?.fullName ?? '',
    studentName: appeal.student?.fullName ?? '',
    studentProfileImageUrl: appeal.student?.profileImageUrl ?? '',
    instructorProfileImageUrl: appeal.instructor?.profileImageUrl ?? '',
    schoolId: appeal.student?.schoolId ?? '',
    sectionInfo: appeal.student?.sectionInfo ?? '',
  };
}

export const useStudentAppeals = (studentId?: string) => {
  return useQuery({
    queryKey: ['student-appeals', studentId],
    queryFn: async () => {
      const { data } = await apiClient.get('/appeals/student');
      return data.map(normalizeAppeal);
    },
  });
};

export const useInstructorAppeals = (instructorId?: string) => {
  return useQuery({
    queryKey: ['instructor-appeals', instructorId],
    queryFn: async () => {
      const { data } = await apiClient.get('/appeals/instructor');
      return data.map(normalizeAppeal);
    },
  });
};

export const useAllAppeals = (enabled = true, viewerId?: string) => {
  return useQuery({
    queryKey: ['appeals', 'all', viewerId],
    queryFn: async () => {
      const { data } = await apiClient.get('/appeals');
      return data.map(normalizeAppeal);
    },
    enabled,
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

export const useUpdateAppealStatus = (instructorId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ appealId, status, instructorRemarks }: { appealId: string; status: string; instructorRemarks?: string }) => {
      const params = new URLSearchParams({ status });
      if (instructorRemarks) params.set('instructorRemarks', instructorRemarks);
      const { data } = await apiClient.put(`/appeals/${appealId}/status?${params.toString()}`);
      return normalizeAppeal(data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-appeals'] });
      queryClient.invalidateQueries({ queryKey: ['appeals'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-appeals', instructorId] });
      queryClient.invalidateQueries({ queryKey: ['student-appeal', variables.appealId] });
      queryClient.invalidateQueries({ queryKey: ['student-appeals', data.studentId != null ? String(data.studentId) : undefined] });
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
