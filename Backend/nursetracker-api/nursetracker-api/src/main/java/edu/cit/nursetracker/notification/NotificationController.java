package edu.cit.nursetracker.notification;

import lombok.RequiredArgsConstructor;
import edu.cit.nursetracker.user.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor

public class NotificationController {

    private final NotificationService notificationService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        return ResponseEntity.ok(notificationService.createNotification(notification));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(
            @PathVariable Long userId,
            @RequestParam(required = false, defaultValue = "false") boolean unreadOnly) {
        
        if (unreadOnly) {
            return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
        }
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/me")
    public ResponseEntity<List<Notification>> getCurrentUserNotifications(HttpServletRequest request, @RequestParam(required = false, defaultValue = "false") boolean unreadOnly) {
        Long userId = jwtService.getUserId(request);
        if (unreadOnly) return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @GetMapping("/me/count")
    public ResponseEntity<Map<String, Long>> getCurrentUnreadCount(HttpServletRequest request) {
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(jwtService.getUserId(request))));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/{id}/unread")
    public ResponseEntity<Notification> markAsUnread(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsUnread(id));
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me/read-all")
    public ResponseEntity<Void> markCurrentAllAsRead(HttpServletRequest request) {
        notificationService.markAllAsRead(jwtService.getUserId(request));
        return ResponseEntity.noContent().build();
    }
}
