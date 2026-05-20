package edu.cit.nursetracker.adminaccess;

import edu.cit.nursetracker.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminAccessPermissionService {
    private final AdminAccessPermissionRepository repository;

    public List<AdminAccessPermission> getByRole(UserRole role) {
        return repository.findByRole(role);
    }

    public AdminAccessPermission setPermission(UserRole role, String permissionKey, boolean enabled) {
        AdminAccessPermission permission = repository.findByRoleAndPermissionKey(role, permissionKey)
                .orElseGet(AdminAccessPermission::new);
        permission.setRole(role);
        permission.setPermissionKey(permissionKey);
        permission.setEnabled(enabled);
        return repository.save(permission);
    }

    public boolean canEdit(UserRole role, String permissionKey) {
        if (role == UserRole.ADMIN || role == UserRole.CHAIR || role == UserRole.INSTRUCTOR) return true;
        if (role != UserRole.ASSISTANT && role != UserRole.COORDINATOR) return false;
        return repository.findByRoleAndPermissionKey(role, permissionKey)
                .map(AdminAccessPermission::isEnabled)
                .orElse(false);
    }
}
