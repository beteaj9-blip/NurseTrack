import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data } = await apiClient.get('/audit-logs');
      return data;
    },
    staleTime: 0,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useCreateAuditLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { action: string; recordName: string; context?: string; category: string }) => {
      const { data } = await apiClient.post('/audit-logs', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
};
