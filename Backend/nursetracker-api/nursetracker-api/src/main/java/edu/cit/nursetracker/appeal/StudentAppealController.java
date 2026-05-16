package edu.cit.nursetracker.appeal;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appeals")
@RequiredArgsConstructor
public class StudentAppealController {

    private final StudentAppealService appealService;
    private final AppealTypeOptionRepository appealTypeOptionRepository;

    @GetMapping("/types")
    public ResponseEntity<List<AppealTypeOption>> getAppealTypes() {
        return ResponseEntity.ok(appealTypeOptionRepository.findAllByOrderByIdAsc());
    }

    @PostMapping
    public ResponseEntity<StudentAppeal> createAppeal(@RequestBody StudentAppeal appeal) {
        return ResponseEntity.ok(appealService.createAppeal(appeal));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<StudentAppeal>> getStudentAppeals(@PathVariable Long studentId) {
        return ResponseEntity.ok(appealService.getStudentAppeals(studentId));
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<StudentAppeal>> getInstructorAppeals(@PathVariable Long instructorId) {
        return ResponseEntity.ok(appealService.getInstructorAppeals(instructorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentAppeal> getAppeal(@PathVariable Long id) {
        return ResponseEntity.ok(appealService.getAppeal(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentAppeal> updateAppeal(@PathVariable Long id, @RequestBody StudentAppeal appeal) {
        return ResponseEntity.ok(appealService.updateAppeal(id, appeal));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<StudentAppeal> updateAppealStatus(
            @PathVariable Long id,
            @RequestParam AppealStatus status,
            @RequestParam(required = false) String instructorRemarks) {
        return ResponseEntity.ok(appealService.updateAppealStatus(id, status, instructorRemarks));
    }
}
