import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../axios';

export const useAboutInfo = () => useQuery({
  queryKey: ['system-info', 'about'],
  queryFn: async () => {
    const { data } = await apiClient.get('/system/about');
    return data;
  },
});
