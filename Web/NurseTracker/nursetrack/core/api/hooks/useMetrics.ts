import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../axios';

export const useOverallMetrics = () => {
  return useQuery({
    queryKey: ['metrics', 'overall'],
    queryFn: async () => {
      const { data } = await apiClient.get('/metrics/overall');
      return data;
    },
  });
};
