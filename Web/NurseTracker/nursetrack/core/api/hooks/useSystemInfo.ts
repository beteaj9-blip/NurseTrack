import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../axios';

export type SystemInfo = {
  id: number;
  version: string;
  lastUpdated: string;
  schoolYear?: string;
  semester?: string;
};

export const useSystemInfo = () => {
  return useQuery({
    queryKey: ['system-info'],
    queryFn: async () => {
      const { data } = await apiClient.get<SystemInfo>('/system/info');
      return data;
    },
  });
};
