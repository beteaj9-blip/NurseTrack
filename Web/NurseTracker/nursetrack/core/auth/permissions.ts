import { useAdminAccessPermissions } from "@/core/api/hooks/useAdminAccessPermissions";
import { useAuthStore } from "@/core/store/authStore";

export function useCanEditFeature(permissionKey: string) {
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role?.toUpperCase();
  const controlledRole = userRole === "ASSISTANT" || userRole === "COORDINATOR";
  const { data = [], isLoading } = useAdminAccessPermissions(userRole ?? "", controlledRole);

  if (!controlledRole) return { canEdit: true, isLoading: false };

  const canEdit = (data as any[]).some((permission) => {
    const keyMatch = permission.permissionKey === permissionKey || permission.permission_key === permissionKey || permission.id === permissionKey;
    const isEnabled = permission.enabled === true || permission.enabled === "true" || permission.enabled === 1;
    return keyMatch && isEnabled;
  });

  return { canEdit, isLoading };
}
