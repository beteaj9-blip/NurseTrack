package edu.cit.nursetracker.appeal;

import lombok.RequiredArgsConstructor;
import edu.cit.nursetracker.user.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appeals")
@RequiredArgsConstructor
public class StudentAppealController {

    private final StudentAppealService appealService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<StudentAppeal> createAppeal(@RequestBody StudentAppeal appeal) {
        return ResponseEntity.ok(appealService.createAppeal(appeal));
    }

    @GetMapping
    public ResponseEntity<List<StudentAppeal>> getAllAppeals(@RequestParam(required = false) Long viewerId, HttpServletRequest request) {
        Long effectiveViewerId = viewerId != null ? viewerId : jwtService.getUserId(request);
        return ResponseEntity.ok(appealService.getAppealsVisibleTo(effectiveViewerId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<StudentAppeal>> getStudentAppeals(@PathVariable Long studentId) {
        return ResponseEntity.ok(appealService.getStudentAppeals(studentId));
    }

    @GetMapping("/student")
    public ResponseEntity<List<StudentAppeal>> getCurrentStudentAppeals(HttpServletRequest request) {
        return ResponseEntity.ok(appealService.getStudentAppeals(jwtService.getUserId(request)));
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<StudentAppeal>> getInstructorAppeals(@PathVariable Long instructorId) {
        return ResponseEntity.ok(appealService.getInstructorAppeals(instructorId));
    }

    @GetMapping("/instructor")
    public ResponseEntity<List<StudentAppeal>> getCurrentInstructorAppeals(HttpServletRequest request) {
        return ResponseEntity.ok(appealService.getInstructorAppeals(jwtService.getUserId(request)));
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
            @RequestParam String status,
            @RequestParam(required = false) String instructorRemarks) {
        return ResponseEntity.ok(appealService.updateAppealStatus(id, parseAppealStatus(status), instructorRemarks));
    }

    @PutMapping("/{id}/recommendation")
    public ResponseEntity<StudentAppeal> updateInstructorRecommendation(
            @PathVariable Long id,
            @RequestParam String instructorDecision,
            @RequestParam(required = false) String instructorRemarks) {
        return ResponseEntity.ok(appealService.updateInstructorRecommendation(id, parseAppealStatus(instructorDecision), instructorRemarks));
    }

    private AppealStatus parseAppealStatus(String value) {
        if (value != null && value.equalsIgnoreCase("REJECTED")) return AppealStatus.RETURNED;
        return AppealStatus.valueOf(String.valueOf(value).toUpperCase());
    }
}
