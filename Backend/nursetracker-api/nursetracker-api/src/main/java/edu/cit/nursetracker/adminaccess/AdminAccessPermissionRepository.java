package edu.cit.nursetracker.adminaccess;

import edu.cit.nursetracker.user.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdminAccessPermissionRepository extends JpaRepository<AdminAccessPermission, Long> {
    List<AdminAccessPermission> findByRole(UserRole role);
    Optional<AdminAccessPermission> findByRoleAndPermissionKey(UserRole role, String permissionKey);
}
