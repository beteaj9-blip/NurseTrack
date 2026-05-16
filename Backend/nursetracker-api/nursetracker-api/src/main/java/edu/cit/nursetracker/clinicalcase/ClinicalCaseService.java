package edu.cit.nursetracker.clinicalcase;

import edu.cit.nursetracker.notification.Notification;
import edu.cit.nursetracker.notification.NotificationService;
import edu.cit.nursetracker.notification.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ClinicalCaseService {

    private final ClinicalCaseRepository caseRepository;
    private final NotificationService notificationService;

    public ClinicalCase submitCase(ClinicalCase clinicalCase) {
        clinicalCase.setStatus(CaseStatus.PENDING);
        return caseRepository.save(clinicalCase);
    }

    public List<ClinicalCase> getStudentCases(Long studentId) {
        return caseRepository.findByStudentIdOrderByCaseDateDesc(studentId);
    }

    public List<RequirementProgressGroup> getStudentRequirementProgress(Long studentId) {
        Map<String, List<ClinicalCase>> grouped = new LinkedHashMap<>();
        for (ClinicalCase clinicalCase : getStudentCases(studentId)) {
            String label = getRequirementLabel(clinicalCase);
            grouped.computeIfAbsent(label, key -> new ArrayList<>()).add(clinicalCase);
        }

        return grouped.entrySet().stream()
                .map(entry -> {
                    String label = entry.getKey();
                    List<ClinicalCase> records = entry.getValue();
                    long completed = records.stream().filter(clinicalCase -> clinicalCase.getStatus() == CaseStatus.APPROVED).count();
                    return new RequirementProgressGroup(
                            buildRequirementCode(label),
                            label,
                            List.of(new RequirementProgressItem(label, completed, records.size()))
                    );
                })
                .toList();
    }

    private String getRequirementLabel(ClinicalCase clinicalCase) {
        if (clinicalCase.getCategory() != null && !clinicalCase.getCategory().isBlank()) return clinicalCase.getCategory();
        if (clinicalCase.getDutyArea() != null && !clinicalCase.getDutyArea().isBlank()) return clinicalCase.getDutyArea();
        if (clinicalCase.getCaseType() != null) return clinicalCase.getCaseType().name();
        return "Clinical Cases";
    }

    private String buildRequirementCode(String label) {
        String uppercaseCode = label.chars()
                .filter(Character::isUpperCase)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
        if (!uppercaseCode.isBlank()) return uppercaseCode;

        return List.of(label.split("\\s+"))
                .stream()
                .filter(part -> !part.isBlank())
                .map(part -> part.substring(0, 1).toUpperCase())
                .limit(3)
                .reduce("", String::concat);
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
        ClinicalCase saved = caseRepository.save(clinicalCase);
        String decision = status == CaseStatus.APPROVED ? "approved" : "rejected";
        notificationService.createNotification(Notification.builder()
                .user(saved.getStudent())
                .title(status == CaseStatus.APPROVED ? "Clinical case approved" : "Clinical case rejected")
                .message("Your " + getRequirementLabel(saved) + " clinical case was " + decision + ".")
                .type(status == CaseStatus.APPROVED ? NotificationType.APPROVAL : NotificationType.RETURNED)
                .actionUrl("/nursing-student/clinical-cases")
                .build());
        return saved;
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
            existingCase.setCategory(updatedCase.getCategory());
            existingCase.setHospital(updatedCase.getHospital());
            existingCase.setDutyArea(updatedCase.getDutyArea());
            existingCase.setShiftTime(updatedCase.getShiftTime());
            existingCase.setCaseDate(updatedCase.getCaseDate());
            existingCase.setStudentReflection(updatedCase.getStudentReflection());
            existingCase.setStatus(CaseStatus.PENDING);
            return caseRepository.save(existingCase);
        }
        return null;
    }
}
