import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../axios';

export const useInstructors = () => {
  return useQuery({
    queryKey: ['users', 'instructors'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users?role=INSTRUCTOR');
      return data;
    },
  });
};

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: number; updates: Record<string, string> }) => {
      const { data } = await apiClient.put(`/users/${userId}`, updates);
      return data;
    },
  });
};
