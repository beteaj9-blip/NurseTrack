import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';

function normalizeClinicalCase(clinicalCase: any) {
  return {
    ...clinicalCase,
    studentId: clinicalCase.studentId ?? clinicalCase.student?.id,
    studentName: clinicalCase.studentName ?? clinicalCase.student?.fullName ?? '',
    studentSchoolId: clinicalCase.studentSchoolId ?? clinicalCase.student?.schoolId ?? '',
    studentSection: clinicalCase.studentSection ?? clinicalCase.student?.sectionInfo ?? '',
    studentProfileImageUrl: clinicalCase.studentProfileImageUrl ?? clinicalCase.student?.profileImageUrl ?? '',
    instructorId: clinicalCase.instructorId ?? clinicalCase.instructor?.id,
    instructorName: clinicalCase.instructorName ?? clinicalCase.instructor?.fullName ?? '',
    instructorProfileImageUrl: clinicalCase.instructorProfileImageUrl ?? clinicalCase.instructor?.profileImageUrl ?? '',
    area: clinicalCase.dutyArea ?? clinicalCase.area ?? clinicalCase.category ?? clinicalCase.caseType,
    hospital: clinicalCase.hospital ?? '',
    procedureDate: clinicalCase.procedureDate ?? clinicalCase.caseDate,
    procedurePerformed: clinicalCase.procedurePerformed ?? clinicalCase.procedureDetails ?? clinicalCase.diagnosis,
  };
}

export const useStudentCases = (studentId?: string) => {
  return useQuery({
    queryKey: ['clinical-cases', 'student', studentId],
    queryFn: async () => {
      const { data } = await apiClient.get('/cases/student');
      return data.map(normalizeClinicalCase);
    },
  });
};

export const useStudentRequirementProgress = (studentId?: string) => {
  return useQuery({
    queryKey: ['clinical-cases', 'student', studentId, 'requirements'],
    queryFn: async () => {
      const { data } = await apiClient.get('/cases/student/requirements');
      return data;
    },
  });
};

export const useClinicalCase = (caseId?: string) => {
  return useQuery({
    queryKey: ['clinical-cases', 'detail', caseId],
    queryFn: async () => {
      if (!caseId) return null;
      const { data } = await apiClient.get(`/cases/${caseId}`);
      return normalizeClinicalCase(data);
    },
    enabled: !!caseId,
  });
};

export const usePendingCases = (instructorId?: string) => {
  return useQuery({
    queryKey: ['clinical-cases', 'instructor', instructorId, 'pending'],
    queryFn: async () => {
      const { data } = await apiClient.get('/cases/instructor');
      return data.map(normalizeClinicalCase);
    },
  });
};

export const useInstructorCases = (instructorId?: string) => {
  return useQuery({
    queryKey: ['clinical-cases', 'instructor', instructorId],
    queryFn: async () => {
      const { data } = await apiClient.get('/cases/instructor');
      return data.map(normalizeClinicalCase);
    },
  });
};

export const useAllClinicalCases = (enabled = true, viewerId?: string) => {
  return useQuery({
    queryKey: ['clinical-cases', 'all', viewerId],
    queryFn: async () => {
      const { data } = await apiClient.get('/cases', { params: viewerId ? { viewerId } : undefined });
      return data.map(normalizeClinicalCase);
    },
    enabled,
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
      queryClient.invalidateQueries({ queryKey: ['clinical-cases', 'student', data.student?.id ?? data.studentId] });
    },
  });
};

export const useUpdateClinicalCase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ caseId, caseData }: { caseId: string; caseData: any }) => {
      const { data } = await apiClient.put(`/cases/${caseId}`, caseData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clinical-cases'] });
      queryClient.invalidateQueries({ queryKey: ['clinical-cases', 'detail', String(data.id)] });
    },
  });
};

export const useDeleteClinicalCase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (caseId: string) => {
      await apiClient.delete(`/cases/${caseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinical-cases'] });
    },
  });
};

export const useReviewCase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ caseId, status, remarks }: { caseId: string; status: string; remarks?: string }) => {
      const { data } = await apiClient.put(`/cases/${caseId}/validate`, null, {
        params: { status, ...(remarks ? { feedback: remarks } : {}) },
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clinical-cases'] });
    },
  });
};
