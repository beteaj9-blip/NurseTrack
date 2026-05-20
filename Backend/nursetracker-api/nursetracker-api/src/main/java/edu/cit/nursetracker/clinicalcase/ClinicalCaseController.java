package edu.cit.nursetracker.clinicalcase;

import lombok.RequiredArgsConstructor;
import edu.cit.nursetracker.user.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor

public class ClinicalCaseController {

    private final ClinicalCaseService caseService;
    private final ClinicalCaseCategoryOptionRepository categoryRepository;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<ClinicalCase> submitCase(@RequestBody ClinicalCase clinicalCase) {
        return ResponseEntity.ok(caseService.submitCase(clinicalCase));
    }

    @GetMapping
    public ResponseEntity<List<ClinicalCase>> getAllCases(@RequestParam(required = false) Long viewerId, HttpServletRequest request) {
        Long effectiveViewerId = viewerId != null ? viewerId : jwtService.getUserId(request);
        return ResponseEntity.ok(caseService.getCasesVisibleTo(effectiveViewerId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ClinicalCase>> getStudentCases(@PathVariable Long studentId) {
        return ResponseEntity.ok(caseService.getStudentCases(studentId));
    }

    @GetMapping("/student")
    public ResponseEntity<List<ClinicalCase>> getCurrentStudentCases(HttpServletRequest request) {
        return ResponseEntity.ok(caseService.getStudentCases(jwtService.getUserId(request)));
    }

    @GetMapping("/student/{studentId}/requirements")
    public ResponseEntity<List<RequirementProgressGroup>> getStudentRequirementProgress(@PathVariable Long studentId) {
        return ResponseEntity.ok(caseService.getStudentRequirementProgress(studentId));
    }

    @GetMapping("/student/requirements")
    public ResponseEntity<List<RequirementProgressGroup>> getCurrentStudentRequirementProgress(HttpServletRequest request) {
        return ResponseEntity.ok(caseService.getStudentRequirementProgress(jwtService.getUserId(request)));
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<ClinicalCase>> getInstructorCases(@PathVariable Long instructorId) {
        return ResponseEntity.ok(caseService.getInstructorCases(instructorId));
    }

    @GetMapping("/instructor")
    public ResponseEntity<List<ClinicalCase>> getCurrentInstructorCases(HttpServletRequest request) {
        return ResponseEntity.ok(caseService.getInstructorCases(jwtService.getUserId(request)));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<ClinicalCaseCategoryOption>> getCaseCategories() {
        return ResponseEntity.ok(categoryRepository.findAllByOrderByIdAsc());
    }

    @PutMapping("/{id}/validate")
    public ResponseEntity<Map<String, Object>> validateCase(
            @PathVariable Long id,
            @RequestParam CaseStatus status,
            @RequestParam(required = false) String feedback) {
        return ResponseEntity.ok(toResponse(caseService.validateCase(id, status, feedback)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClinicalCase> getCaseById(@PathVariable Long id) {
        ClinicalCase clinicalCase = caseService.getCaseById(id);
        return clinicalCase != null ? ResponseEntity.ok(clinicalCase) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClinicalCase> updateCase(@PathVariable Long id, @RequestBody ClinicalCase clinicalCase, HttpServletRequest request) {
        ClinicalCase updatedCase = caseService.updateCase(id, clinicalCase, jwtService.getUserId(request));
        return updatedCase != null ? ResponseEntity.ok(updatedCase) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCase(@PathVariable Long id, HttpServletRequest request) {
        caseService.deleteCase(id, jwtService.getUserId(request));
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toResponse(ClinicalCase clinicalCase) {
        return Map.ofEntries(
                Map.entry("id", clinicalCase.getId()),
                Map.entry("studentId", clinicalCase.getStudent().getId()),
                Map.entry("studentName", clinicalCase.getStudent().getFullName()),
                Map.entry("studentSchoolId", clinicalCase.getStudent().getSchoolId()),
                Map.entry("studentSection", clinicalCase.getStudent().getSectionInfo() == null ? "" : clinicalCase.getStudent().getSectionInfo()),
                Map.entry("studentProfileImageUrl", clinicalCase.getStudent().getProfileImageUrl() == null ? "" : clinicalCase.getStudent().getProfileImageUrl()),
                Map.entry("instructorId", clinicalCase.getInstructor().getId()),
                Map.entry("instructorName", clinicalCase.getInstructor().getFullName()),
                Map.entry("instructorProfileImageUrl", clinicalCase.getInstructor().getProfileImageUrl() == null ? "" : clinicalCase.getInstructor().getProfileImageUrl()),
                Map.entry("caseType", clinicalCase.getCaseType()),
                Map.entry("patientInitials", clinicalCase.getPatientInitials()),
                Map.entry("category", clinicalCase.getCategory() == null ? "" : clinicalCase.getCategory()),
                Map.entry("hospital", clinicalCase.getHospital() == null ? "" : clinicalCase.getHospital()),
                Map.entry("dutyArea", clinicalCase.getDutyArea() == null ? "" : clinicalCase.getDutyArea()),
                Map.entry("shiftTime", clinicalCase.getShiftTime() == null ? "" : clinicalCase.getShiftTime()),
                Map.entry("caseDate", clinicalCase.getCaseDate()),
                Map.entry("diagnosis", clinicalCase.getDiagnosis()),
                Map.entry("procedureDetails", clinicalCase.getProcedureDetails()),
                Map.entry("studentReflection", clinicalCase.getStudentReflection() == null ? "" : clinicalCase.getStudentReflection()),
                Map.entry("status", clinicalCase.getStatus()),
                Map.entry("instructorFeedback", clinicalCase.getInstructorFeedback() == null ? "" : clinicalCase.getInstructorFeedback()),
                Map.entry("createdAt", clinicalCase.getCreatedAt()),
                Map.entry("updatedAt", clinicalCase.getUpdatedAt())
        );
    }
}
