package edu.cit.nursetracker.extensionday;

import edu.cit.nursetracker.notification.Notification;
import edu.cit.nursetracker.notification.NotificationService;
import edu.cit.nursetracker.notification.NotificationType;
import edu.cit.nursetracker.user.JwtService;
import edu.cit.nursetracker.user.AccessScope;
import edu.cit.nursetracker.user.User;
import edu.cit.nursetracker.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/extension-days")
@RequiredArgsConstructor
public class ExtensionDayController {
    private final ExtensionDayRepository extensionDayRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<List<ExtensionDay>> getAll(@RequestParam(required = false) Long studentId, @RequestParam(required = false) Long viewerId, HttpServletRequest request) {
        Long effectiveViewerId = viewerId != null ? viewerId : jwtService.getUserId(request);
        return ResponseEntity.ok(filterVisible(extensionDayRepository.findAllByOrderByCreatedAtDesc(), effectiveViewerId).stream()
                .filter(record -> record.getStudent() != null && record.getStudent().getRole() == edu.cit.nursetracker.user.UserRole.STUDENT)
                .filter(record -> studentId == null || record.getStudent().getId().equals(studentId))
                .toList());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ExtensionDay>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(extensionDayRepository.findByStudentIdOrderByCreatedAtDesc(studentId));
    }

    @GetMapping("/student")
    public ResponseEntity<List<ExtensionDay>> getCurrentStudent(HttpServletRequest request) {
        return ResponseEntity.ok(extensionDayRepository.findByStudentIdOrderByCreatedAtDesc(jwtService.getUserId(request)));
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<ExtensionDay>> getByInstructor(@PathVariable Long instructorId, @RequestParam(required = false) Long studentId) {
        if (studentId != null) return ResponseEntity.ok(extensionDayRepository.findByInstructorIdAndStudentIdOrderByCreatedAtDesc(instructorId, studentId));
        return ResponseEntity.ok(extensionDayRepository.findByInstructorIdOrderByCreatedAtDesc(instructorId).stream()
                .filter(record -> record.getStudent() != null && record.getStudent().getRole() == edu.cit.nursetracker.user.UserRole.STUDENT)
                .toList());
    }

    @GetMapping("/instructor")
    public ResponseEntity<List<ExtensionDay>> getCurrentInstructor(HttpServletRequest request, @RequestParam(required = false) Long studentId) {
        return getByInstructor(jwtService.getUserId(request), studentId);
    }

    @PostMapping
    public ResponseEntity<ExtensionDay> create(@RequestBody ExtensionDayRequest request) {
        User student = userRepository.findById(request.getStudentId()).orElseThrow(() -> new RuntimeException("Student not found."));
        User instructor = userRepository.findById(request.getInstructorId()).orElseThrow(() -> new RuntimeException("Instructor not found."));
        ExtensionDay extensionDay = ExtensionDay.builder()
                .student(student)
                .instructor(instructor)
                .days(request.getDays())
                .basis(request.getBasis())
                .reason(request.getReason())
                .status(ExtensionDayStatus.ACTIVE)
                .build();
        ExtensionDay saved = extensionDayRepository.save(extensionDay);
        notifyStudent(student, "Extension days added", instructor.getFullName() + " added " + saved.getDays() + " extension day" + (saved.getDays() == 1 ? "" : "s") + " to your progress record.");
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExtensionDay> update(@PathVariable Long id, @RequestBody ExtensionDayRequest request) {
        ExtensionDay extensionDay = extensionDayRepository.findById(id).orElseThrow(() -> new RuntimeException("Extension day not found."));
        extensionDay.setDays(request.getDays());
        extensionDay.setBasis(request.getBasis());
        extensionDay.setReason(request.getReason());
        ExtensionDay saved = extensionDayRepository.save(extensionDay);
        notifyStudent(saved.getStudent(), "Extension days updated", "Your extension-day record was updated to " + saved.getDays() + " extension day" + (saved.getDays() == 1 ? "" : "s") + ".");
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ExtensionDay> cancel(@PathVariable Long id) {
        ExtensionDay extensionDay = extensionDayRepository.findById(id).orElseThrow(() -> new RuntimeException("Extension day not found."));
        extensionDay.setStatus(ExtensionDayStatus.CANCELED);
        ExtensionDay saved = extensionDayRepository.save(extensionDay);
        notifyStudent(saved.getStudent(), "Extension days canceled", "An extension-day record was canceled and no longer counts toward your progress.");
        return ResponseEntity.ok(saved);
    }

    private void notifyStudent(User student, String title, String message) {
        notificationService.createNotification(Notification.builder()
                .user(student)
                .title(title)
                .message(message)
                .type(NotificationType.SCHEDULE_CHANGE)
                .actionUrl("/nursing-student/student-progress")
                .build());
    }

    private List<ExtensionDay> filterVisible(List<ExtensionDay> records, Long viewerId) {
        return userRepository.findById(viewerId)
                .map(viewer -> records.stream()
                        .filter(record -> AccessScope.canViewRecord(viewer, record.getStudent(), record.getInstructor()))
                        .toList())
                .orElse(List.of());
    }
}
