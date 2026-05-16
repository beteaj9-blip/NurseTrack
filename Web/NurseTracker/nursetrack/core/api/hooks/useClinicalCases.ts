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
      if (!studentId) return [];
      const { data } = await apiClient.get(`/cases/student/${studentId}`);
      return data.map(normalizeClinicalCase);
    },
    enabled: !!studentId,
  });
};

export const useStudentRequirementProgress = (studentId?: string) => {
  return useQuery({
    queryKey: ['clinical-cases', 'student', studentId, 'requirements'],
    queryFn: async () => {
      if (!studentId) return [];
      const { data } = await apiClient.get(`/cases/student/${studentId}/requirements`);
      return data;
    },
    enabled: !!studentId,
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
      if (!instructorId) return [];
      // The new backend doesn't have a /pending filter, so we'll fetch all and filter client-side if needed, 
      // or assume the backend handles it. For now let's just fetch all instructor cases.
      const { data } = await apiClient.get(`/cases/instructor/${instructorId}`);
      return data.map(normalizeClinicalCase);
    },
    enabled: !!instructorId,
  });
};

export const useInstructorCases = (instructorId?: string) => {
  return useQuery({
    queryKey: ['clinical-cases', 'instructor', instructorId],
    queryFn: async () => {
      if (!instructorId) return [];
      const { data } = await apiClient.get(`/cases/instructor/${instructorId}`);
      return data.map(normalizeClinicalCase);
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
      queryClient.invalidateQueries({ queryKey: ['clinical-cases', 'student', data.student?.id ?? data.studentId] });
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
