import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';

export const useAdminAccessPermissions = (role: string, enabled = true) => {
  return useQuery({
    queryKey: ['admin-access-permissions', role],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-access-permissions', { params: { role } });
      return data;
    },
    enabled: enabled && Boolean(role),
  });
};

export const useUpdateAdminAccessPermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ role, permissionKey, enabled }: { role: string; permissionKey: string; enabled: boolean }) => {
      const { data } = await apiClient.put(`/admin-access-permissions/${role}/${permissionKey}`, { enabled });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-access-permissions', variables.role] });
    },
  });
};
