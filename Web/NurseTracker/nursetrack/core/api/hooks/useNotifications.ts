import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';

export const useNotifications = (userId?: string, enabled = true) => {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await apiClient.get(`/notifications/user/${userId}`);
      return data;
    },
    enabled: enabled && !!userId,
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
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
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
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });
};

export const useMarkAllNotificationsRead = (userId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!userId) return;
      await apiClient.put(`/notifications/user/${userId}/read-all`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });
};
