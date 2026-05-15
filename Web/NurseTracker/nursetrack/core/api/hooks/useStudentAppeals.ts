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
