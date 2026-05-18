package edu.cit.nursetracker.clearance;

import edu.cit.nursetracker.academicterm.AcademicTerm;
import edu.cit.nursetracker.academicterm.AcademicTermRepository;
import edu.cit.nursetracker.user.JwtService;
import edu.cit.nursetracker.user.User;
import edu.cit.nursetracker.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/clearances")
@RequiredArgsConstructor
public class StudentClearanceController {

    private final StudentClearanceRepository clearanceRepository;
    private final UserRepository userRepository;
    private final AcademicTermRepository academicTermRepository;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<List<StudentClearance>> getAllClearances(HttpServletRequest request) {
        Long viewerId = jwtService.getUserId(request);
        User viewer = userRepository.findById(viewerId).orElse(null);
        if (viewer == null) return ResponseEntity.ok(List.of());
        if (viewer.getRole() == edu.cit.nursetracker.user.UserRole.ADMIN) return ResponseEntity.ok(clearanceRepository.findAll());
        Set<Integer> visibleLevels = viewer.getAssignedLevels();
        if (visibleLevels == null || visibleLevels.isEmpty()) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(clearanceRepository.findAll().stream()
                .filter(clearance -> intersects(clearance.getStudent().getAssignedLevels(), visibleLevels))
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

    @PostMapping("/student/{studentId}/submit")
    public ResponseEntity<StudentClearance> submitForClearance(@PathVariable Long studentId) {
        StudentClearance clearance = clearanceRepository.findFirstByStudentIdOrderByCreatedAtDesc(studentId)
                .orElseGet(() -> createDefaultClearance(studentId));
        clearance.setStatus(ClearanceStatus.IN_REVIEW);
        clearance.setSubmittedAt(LocalDateTime.now());
        return ResponseEntity.ok(clearanceRepository.save(clearance));
    }

    @PostMapping("/student/submit")
    public ResponseEntity<StudentClearance> submitCurrentStudentForClearance(HttpServletRequest request) {
        return submitForClearance(jwtService.getUserId(request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<StudentClearance> updateClearanceStatus(@PathVariable Long id, @RequestParam ClearanceStatus status) {
        StudentClearance clearance = clearanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clearance record not found."));
        clearance.setStatus(status);
        if (status == ClearanceStatus.IN_REVIEW && clearance.getSubmittedAt() == null) {
            clearance.setSubmittedAt(LocalDateTime.now());
        }
        return ResponseEntity.ok(clearanceRepository.save(clearance));
    }

    private StudentClearance createDefaultClearance(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found."));
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

    private boolean intersects(Set<Integer> recordLevels, Set<Integer> visibleLevels) {
        if (recordLevels == null || recordLevels.isEmpty()) return false;
        Set<Integer> overlap = new HashSet<>(recordLevels);
        overlap.retainAll(visibleLevels);
        return !overlap.isEmpty();
    }
}
