package edu.cit.nursetracker.adminaccess;

import edu.cit.nursetracker.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin-access-permissions")
@RequiredArgsConstructor
public class AdminAccessPermissionController {
    private final AdminAccessPermissionService service;

    @GetMapping
    public ResponseEntity<List<AdminAccessPermission>> getPermissions(@RequestParam UserRole role) {
        return ResponseEntity.ok(service.getByRole(role));
    }

    @PutMapping("/{role}/{permissionKey}")
    public ResponseEntity<AdminAccessPermission> setPermission(
            @PathVariable UserRole role,
            @PathVariable String permissionKey,
            @RequestBody Map<String, Boolean> payload) {
        return ResponseEntity.ok(service.setPermission(role, permissionKey, payload.getOrDefault("enabled", false)));
    }
}
