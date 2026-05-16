package edu.cit.nursetracker.clinicalcase;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor

public class ClinicalCaseController {

    private final ClinicalCaseService caseService;

    @PostMapping
    public ResponseEntity<ClinicalCase> submitCase(@RequestBody ClinicalCase clinicalCase) {
        return ResponseEntity.ok(caseService.submitCase(clinicalCase));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ClinicalCase>> getStudentCases(@PathVariable Long studentId) {
        return ResponseEntity.ok(caseService.getStudentCases(studentId));
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<ClinicalCase>> getInstructorCases(@PathVariable Long instructorId) {
        return ResponseEntity.ok(caseService.getInstructorCases(instructorId));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, String>>> getCaseCategories() {
        return ResponseEntity.ok(List.of(
                Map.of("value", "Major Cases - Scrub", "label", "Major Case - Assist"),
                Map.of("value", "Major Cases - Circulating", "label", "Major Case - Circulate"),
                Map.of("value", "Handled Cases", "label", "Handled Case")
        ));
    }

    @PutMapping("/{id}/validate")
    public ResponseEntity<ClinicalCase> validateCase(
            @PathVariable Long id,
            @RequestParam CaseStatus status,
            @RequestParam(required = false) String feedback) {
        return ResponseEntity.ok(caseService.validateCase(id, status, feedback));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClinicalCase> getCaseById(@PathVariable Long id) {
        ClinicalCase clinicalCase = caseService.getCaseById(id);
        return clinicalCase != null ? ResponseEntity.ok(clinicalCase) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClinicalCase> updateCase(@PathVariable Long id, @RequestBody ClinicalCase clinicalCase) {
        ClinicalCase updatedCase = caseService.updateCase(id, clinicalCase);
        return updatedCase != null ? ResponseEntity.ok(updatedCase) : ResponseEntity.notFound().build();
    }
}
