import { useAdminAccessPermissions } from "@/core/api/hooks/useAdminAccessPermissions";
import { useAuthStore } from "@/core/store/authStore";

export function useCanEditFeature(permissionKey: string) {
  const user = useAuthStore((state) => state.user);
  const controlledRole = user?.role === "ASSISTANT" || user?.role === "COORDINATOR";
  const { data = [], isLoading } = useAdminAccessPermissions(user?.role ?? "", controlledRole);

  if (!controlledRole) return { canEdit: true, isLoading: false };

  const canEdit = (data as { permissionKey: string; enabled: boolean }[]).some(
    (permission) => permission.permissionKey === permissionKey && permission.enabled,
  );

  return { canEdit, isLoading };
}
