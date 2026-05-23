import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';

function formatDate(dateTime?: string) {
  return dateTime ? dateTime.split('T')[0] : '';
}

function formatTime(dateTime?: string) {
  if (!dateTime) return '';
  const [, time = ''] = dateTime.split('T');
  const [hours = '0', minutes = '00'] = time.split(':');
  const hourNumber = Number(hours);
  const period = hourNumber >= 12 ? 'PM' : 'AM';
  const displayHour = hourNumber % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
}

function normalizeDuty(record: any) {
  return {
    ...record,
    studentId: record.studentId ?? record.student?.id,
    studentName: record.studentName ?? record.student?.fullName ?? '',
    studentSchoolId: record.studentSchoolId ?? record.student?.schoolId ?? '',
    studentSection: record.studentSection || (record.student?.sectionInfo ? (record.student.groupInfo ? `${record.student.sectionInfo} - ${record.student.groupInfo}` : record.student.sectionInfo) : ''),
    studentProfileImageUrl: record.studentProfileImageUrl ?? record.student?.profileImageUrl ?? '',
    instructorId: record.instructorId ?? record.instructor?.id,
    instructorName: record.instructorName ?? record.instructor?.fullName ?? '',
    instructorProfileImageUrl: record.instructorProfileImageUrl ?? record.instructor?.profileImageUrl ?? '',
    area: record.area ?? record.ward,
    dutyDate: record.dutyDate ?? formatDate(record.timeIn),
    timeInLabel: record.timeInLabel ?? formatTime(record.timeIn),
    timeOutLabel: record.timeOutLabel ?? formatTime(record.timeOut),
    hours: Number(record.totalHours ?? record.hours ?? 0),
    overtime: Number(record.overtime ?? 0),
  };
}

export const useAttendance = (studentId?: string) => {
  return useQuery({
    queryKey: ['attendance', studentId],
    queryFn: async () => {
      const { data } = await apiClient.get(studentId ? `/duties/student/${studentId}` : '/duties/student');
      return data.map(normalizeDuty);
    },
  });
};

export const useInstructorAttendance = (instructorId?: string) => {
  return useQuery({
    queryKey: ['attendance', 'instructor', instructorId],
    queryFn: async () => {
      const { data } = await apiClient.get('/duties/instructor');
      return data.map(normalizeDuty);
    },
  });
};

export const useAllAttendance = (enabled = true, viewerId?: string, includeInstructors = false) => {
  return useQuery({
    queryKey: ['attendance', 'all', viewerId, includeInstructors],
    queryFn: async () => {
      const params: any = {};
      if (viewerId) params.viewerId = viewerId;
      if (includeInstructors) params.includeInstructors = 'true';
      const { data } = await apiClient.get('/duties', { params: Object.keys(params).length ? params : undefined });
      return data.map(normalizeDuty);
    },
    enabled,
  });
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dutyRecord: any) => {
      // Assuming check-in means time-in
      const { data } = await apiClient.post(`/duties/time-in`, dutyRecord);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
};

export const useVerifyAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (recordId: string) => {
      // By default setting status to VALIDATED or APPROVED. The new backend expects DutyStatus status.
      const { data } = await apiClient.put(`/duties/${recordId}/validate?status=VALIDATED`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
};
