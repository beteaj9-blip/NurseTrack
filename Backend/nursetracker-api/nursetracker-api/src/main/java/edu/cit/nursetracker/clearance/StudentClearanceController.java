package edu.cit.nursetracker.clearance;

import edu.cit.nursetracker.academicterm.AcademicTerm;
import edu.cit.nursetracker.academicterm.AcademicTermRepository;
import edu.cit.nursetracker.adminaccess.AdminAccessPermissionService;
import edu.cit.nursetracker.user.AccessScope;
import edu.cit.nursetracker.user.JwtService;
import edu.cit.nursetracker.user.User;
import edu.cit.nursetracker.user.UserRepository;
import edu.cit.nursetracker.user.UserRole;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clearances")
@RequiredArgsConstructor
public class StudentClearanceController {

    private final StudentClearanceRepository clearanceRepository;
    private final UserRepository userRepository;
    private final AcademicTermRepository academicTermRepository;
    private final ClearanceSettingsRepository settingsRepository;
    private final JwtService jwtService;
    private final AdminAccessPermissionService accessPermissionService;

    @GetMapping
    public ResponseEntity<List<StudentClearance>> getAllClearances(HttpServletRequest request) {
        Long viewerId = jwtService.getUserId(request);
        User viewer = userRepository.findById(viewerId).orElse(null);
        if (viewer == null) return ResponseEntity.ok(List.of());
        
        // Fetch all existing clearances
        List<StudentClearance> existingClearances = clearanceRepository.findAll().stream()
                .filter(this::isStudentClearance)
                .toList();
                
        // Map by student ID
        Map<Long, StudentClearance> clearanceMap = existingClearances.stream()
                .collect(java.util.stream.Collectors.toMap(c -> c.getStudent().getId(), c -> c, (a, b) -> a));
                
        // Fetch all students
        List<User> allStudents = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.STUDENT)
                .toList();
                
        AcademicTerm activeTerm = academicTermRepository.findFirstByActiveTrueOrderByUpdatedAtDesc().orElse(null);
        String schoolYear = activeTerm == null ? "" : activeTerm.getSchoolYear();
        String semester = activeTerm == null ? "" : activeTerm.getSemester();
        
        // Ensure every student has a clearance record returned
        List<StudentClearance> allClearances = allStudents.stream().map(student -> {
            return clearanceMap.computeIfAbsent(student.getId(), id -> 
                StudentClearance.builder()
                    .student(student)
                    .schoolYear(schoolYear)
                    .semester(semester)
                    .status(ClearanceStatus.LOCKED)
                    .build()
            );
        }).toList();

        if (AccessScope.canViewAll(viewer)) return ResponseEntity.ok(allClearances);
        return ResponseEntity.ok(allClearances.stream()
                .filter(clearance -> AccessScope.canViewRecord(viewer, clearance.getStudent(), null))
                .toList());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<StudentClearance> getStudentClearance(@PathVariable Long studentId) {
        return clearanceRepository.findFirstByStudentIdOrderByCreatedAtDesc(studentId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(createDefaultClearance(studentId)));
    }

    @GetMapping("/student")
    public ResponseEntity<StudentClearance> getCurrentStudentClearance(HttpServletRequest request) {
        return getStudentClearance(jwtService.getUserId(request));
    }

    @GetMapping("/settings")
    public ResponseEntity<ClearanceSettings> getSettings() {
        return ResponseEntity.ok(currentSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<ClearanceSettings> updateSettings(@RequestBody Map<String, Boolean> payload) {
        ClearanceSettings settings = currentSettings();
        settings.setEnabled(payload.getOrDefault("enabled", settings.isEnabled()));
        return ResponseEntity.ok(settingsRepository.save(settings));
    }

    @PostMapping("/student/{studentId}/submit")
    public ResponseEntity<?> submitForClearance(@PathVariable Long studentId) {
        if (!currentSettings().isEnabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Clearance submission is currently disabled."));
        }
        StudentClearance clearance = clearanceRepository.findFirstByStudentIdOrderByCreatedAtDesc(studentId)
                .orElseGet(() -> createDefaultClearance(studentId));
        clearance.setStatus(ClearanceStatus.IN_REVIEW);
        clearance.setSubmittedAt(LocalDateTime.now());
        return ResponseEntity.ok(clearanceRepository.save(clearance));
    }

    @PostMapping("/student/submit")
    public ResponseEntity<?> submitCurrentStudentForClearance(HttpServletRequest request) {
        return submitForClearance(jwtService.getUserId(request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<StudentClearance> updateClearanceStatus(@PathVariable Long id, @RequestParam String status, HttpServletRequest request) {
        ClearanceStatus normalizedStatus = parseClearanceStatus(status);
        StudentClearance clearance = clearanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clearance record not found."));
        User viewer = userRepository.findById(jwtService.getUserId(request)).orElse(null);
        if (viewer == null || !AccessScope.canViewRecord(viewer, clearance.getStudent(), null) || !accessPermissionService.canEdit(viewer.getRole(), "clearance")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (normalizedStatus == ClearanceStatus.CLEARED 
                && clearance.getStatus() != ClearanceStatus.IN_REVIEW 
                && clearance.getStatus() != ClearanceStatus.CLEARED) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot approve a clearance that has not been submitted.");
        }
        clearance.setStatus(normalizedStatus);
        if (normalizedStatus == ClearanceStatus.IN_REVIEW && clearance.getSubmittedAt() == null) {
            clearance.setSubmittedAt(LocalDateTime.now());
        }
        return ResponseEntity.ok(clearanceRepository.save(clearance));
    }

    private StudentClearance createDefaultClearance(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found."));
        if (student.getRole() != UserRole.STUDENT) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, "Clearance records are only available for students.");
        }
        AcademicTerm activeTerm = academicTermRepository.findFirstByActiveTrueOrderByUpdatedAtDesc().orElse(null);
        String schoolYear = activeTerm == null ? "" : activeTerm.getSchoolYear();
        String semester = activeTerm == null ? "" : activeTerm.getSemester();
        return clearanceRepository.save(StudentClearance.builder()
                .student(student)
                .schoolYear(schoolYear)
                .semester(semester)
                .status(ClearanceStatus.LOCKED)
                .build());
    }

    private boolean isStudentClearance(StudentClearance clearance) {
        return clearance.getStudent() != null && clearance.getStudent().getRole() == UserRole.STUDENT;
    }

    private ClearanceSettings currentSettings() {
        return settingsRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> settingsRepository.save(ClearanceSettings.builder().enabled(true).build()));
    }

    private ClearanceStatus parseClearanceStatus(String value) {
        if (value != null && value.equalsIgnoreCase("APPROVED")) return ClearanceStatus.CLEARED;
        if (value != null && (value.equalsIgnoreCase("PENDING") || value.equalsIgnoreCase("SUBMITTED"))) return ClearanceStatus.IN_REVIEW;
        if (value != null && value.equalsIgnoreCase("CANCELLED")) return ClearanceStatus.LOCKED;
        return ClearanceStatus.valueOf(String.valueOf(value).toUpperCase());
    }

}
