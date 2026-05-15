package edu.cit.nursetracker.clinicalcase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClinicalCaseService {

    private final ClinicalCaseRepository caseRepository;

    public ClinicalCase submitCase(ClinicalCase clinicalCase) {
        clinicalCase.setStatus(CaseStatus.PENDING);
        return caseRepository.save(clinicalCase);
    }

    public List<ClinicalCase> getStudentCases(Long studentId) {
        return caseRepository.findByStudentIdOrderByCaseDateDesc(studentId);
    }

    public List<ClinicalCase> getInstructorCases(Long instructorId) {
        return caseRepository.findByInstructorIdOrderByCaseDateDesc(instructorId);
    }

    public ClinicalCase validateCase(Long caseId, CaseStatus status, String feedback) {
        ClinicalCase clinicalCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Clinical Case not found."));
        
        clinicalCase.setStatus(status);
        if (feedback != null) {
            clinicalCase.setInstructorFeedback(feedback);
        }
        return caseRepository.save(clinicalCase);
    }

    public ClinicalCase getCaseById(Long id) {
        return caseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clinical Case not found."));
    }

    public ClinicalCase updateCase(Long id, ClinicalCase updatedCase) {
        ClinicalCase existingCase = getCaseById(id);
        if (existingCase != null) {
            existingCase.setCaseType(updatedCase.getCaseType());
            existingCase.setDiagnosis(updatedCase.getDiagnosis());
            existingCase.setProcedureDetails(updatedCase.getProcedureDetails());
            existingCase.setPatientInitials(updatedCase.getPatientInitials());
            existingCase.setPatientAge(updatedCase.getPatientAge());
            existingCase.setCaseDate(updatedCase.getCaseDate());
            existingCase.setStatus(CaseStatus.PENDING);
            return caseRepository.save(existingCase);
        }
        return null;
    }
}
