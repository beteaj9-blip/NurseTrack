import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';

export const useUsers = (role?: string, viewerId?: string, enabled = true) => {
  return useQuery({
    queryKey: ['users', role ?? 'all', viewerId],
    queryFn: async () => {
      const { data } = await apiClient.get('/users', { params: { ...(role && role !== 'all' ? { role } : {}), ...(viewerId ? { viewerId } : {}) } });
      return data;
    },
    enabled,
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users/me');
      return data;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useUserById = (userId?: string) => {
  return useQuery({
    queryKey: ['users', 'detail', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await apiClient.get(`/users/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
};

export const useInstructors = (viewerId?: string) => {
  return useQuery({
    queryKey: ['users', 'instructors', viewerId],
    queryFn: async () => {
      const { data } = await apiClient.get('/users', { params: { role: 'INSTRUCTOR', ...(viewerId ? { viewerId } : {}) } });
      return data;
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ updates }: { userId?: number; updates: Record<string, string> }) => {
      const { data } = await apiClient.put('/users/me', updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useAdminCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const { data } = await apiClient.post('/users', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useAdminUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: number; updates: Record<string, string> }) => {
      const { data } = await apiClient.put(`/users/${userId}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useAdminResetPassword = () => {
  return useMutation({
    mutationFn: async ({ userId }: { userId: number }) => {
      const { data } = await apiClient.put<{ password: string }>(`/users/${userId}/password/reset`);
      return data;
    },
  });
};

export const useImportSectionAssignments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post('/users/section-import', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['academic-terms'] });
    },
  });
};

export const usePreviewSectionAssignments = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post('/users/section-import/preview', formData);
      return data;
    },
  });
};

export const usePublishSectionAssignments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (preview: any) => {
      const { data } = await apiClient.post('/users/section-import/publish', preview);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['academic-terms'] });
    },
  });
};
