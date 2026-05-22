import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';

export const useNotifications = (userId?: string, enabled = true) => {
  return useQuery({
    queryKey: userId ? ['notifications', userId] : ['notifications'],
    queryFn: async () => {
      const { data } = await apiClient.get('/notifications/me');
      return data;
    },
    enabled,
    refetchInterval: enabled ? 5000 : false,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useMarkNotificationRead = (userId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: number) => {
      const { data } = await apiClient.put(`/notifications/${notificationId}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.refetchQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkNotificationUnread = (userId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: number) => {
      const { data } = await apiClient.put(`/notifications/${notificationId}/unread`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.refetchQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = (userId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.put('/notifications/me/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.refetchQueries({ queryKey: ['notifications'] });
    },
  });
};

