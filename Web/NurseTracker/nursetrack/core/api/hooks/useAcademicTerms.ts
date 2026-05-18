import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../axios';

export type AcademicTerm = {
  id: number;
  schoolYear: string;
  semester: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export const useActiveAcademicTerm = () => {
  return useQuery({
    queryKey: ['academic-terms', 'active'],
    queryFn: async () => {
      const { data } = await apiClient.get<AcademicTerm>('/academic-terms/active');
      return data;
    },
  });
};
