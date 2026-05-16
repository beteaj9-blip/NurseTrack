package edu.cit.nursetracker.clearance;

import edu.cit.nursetracker.SystemInfo;
import edu.cit.nursetracker.SystemInfoRepository;
import edu.cit.nursetracker.user.User;
import edu.cit.nursetracker.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/clearances")
@RequiredArgsConstructor
public class StudentClearanceController {

    private final StudentClearanceRepository clearanceRepository;
    private final UserRepository userRepository;
    private final SystemInfoRepository systemInfoRepository;

    @GetMapping
    public ResponseEntity<List<StudentClearance>> getAllClearances() {
        return ResponseEntity.ok(clearanceRepository.findAll());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<StudentClearance> getStudentClearance(@PathVariable Long studentId) {
        return clearanceRepository.findFirstByStudentIdOrderByCreatedAtDesc(studentId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(createDefaultClearance(studentId)));
    }

    @PostMapping("/student/{studentId}/submit")
    public ResponseEntity<StudentClearance> submitForClearance(@PathVariable Long studentId) {
        StudentClearance clearance = clearanceRepository.findFirstByStudentIdOrderByCreatedAtDesc(studentId)
                .orElseGet(() -> createDefaultClearance(studentId));
        clearance.setStatus(ClearanceStatus.IN_REVIEW);
        clearance.setSubmittedAt(LocalDateTime.now());
        return ResponseEntity.ok(clearanceRepository.save(clearance));
    }

    private StudentClearance createDefaultClearance(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found."));
        List<SystemInfo> systemInfo = systemInfoRepository.findAll();
        String schoolYear = systemInfo.isEmpty() ? "" : systemInfo.get(0).getSchoolYear();
        String semester = systemInfo.isEmpty() ? "" : systemInfo.get(0).getSemester();
        return clearanceRepository.save(StudentClearance.builder()
                .student(student)
                .schoolYear(schoolYear)
                .semester(semester)
                .status(ClearanceStatus.LOCKED)
                .build());
    }
}
