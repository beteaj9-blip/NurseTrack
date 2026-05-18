import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export const useCreateHospital = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.post('/hospitals', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
    },
  });
};

export const useUpdateHospital = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Record<string, unknown> }) => {
      const { data } = await apiClient.put(`/hospitals/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
    },
  });
};

export const useAddHospitalWard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ hospitalId, name }: { hospitalId: number; name: string }) => {
      const { data } = await apiClient.post(`/hospitals/${hospitalId}/wards`, { name });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
    },
  });
};

export const useDeleteHospital = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/hospitals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
    },
  });
};
