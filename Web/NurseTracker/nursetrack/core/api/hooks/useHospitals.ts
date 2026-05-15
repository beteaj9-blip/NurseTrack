import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../axios';

export const useHospitals = () => {
  return useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const { data } = await apiClient.get('/hospitals');
      return data;
    },
  });
};
