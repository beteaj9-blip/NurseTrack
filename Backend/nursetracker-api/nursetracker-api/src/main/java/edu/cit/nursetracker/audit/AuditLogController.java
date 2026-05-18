package edu.cit.nursetracker.audit;

import edu.cit.nursetracker.user.JwtService;
import edu.cit.nursetracker.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {
    private final AuditLogService auditLogService;
    private final UserService userService;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogService.getAll());
    }

    @PostMapping
    public ResponseEntity<AuditLog> createAuditLog(HttpServletRequest request, @RequestBody Map<String, String> payload) {
        return userService.getUserById(jwtService.getUserId(request))
                .map(actor -> ResponseEntity.ok(auditLogService.create(
                        actor,
                        payload.getOrDefault("action", "Updated record"),
                        payload.getOrDefault("recordName", "System record"),
                        payload.getOrDefault("context", ""),
                        payload.getOrDefault("category", "system")
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}
