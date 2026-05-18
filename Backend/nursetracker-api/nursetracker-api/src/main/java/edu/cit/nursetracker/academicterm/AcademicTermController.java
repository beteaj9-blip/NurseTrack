package edu.cit.nursetracker.academicterm;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academic-terms")
@RequiredArgsConstructor
public class AcademicTermController {
    private final AcademicTermRepository academicTermRepository;

    @GetMapping
    public ResponseEntity<List<AcademicTerm>> getTerms() {
        return ResponseEntity.ok(academicTermRepository.findAllByOrderByUpdatedAtDesc());
    }

    @GetMapping("/active")
    public ResponseEntity<AcademicTerm> getActiveTerm() {
        return academicTermRepository.findFirstByActiveTrueOrderByUpdatedAtDesc()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
