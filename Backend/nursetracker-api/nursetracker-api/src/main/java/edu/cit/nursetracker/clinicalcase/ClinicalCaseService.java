package edu.cit.nursetracker.clinicalcase;

import edu.cit.nursetracker.notification.Notification;
import edu.cit.nursetracker.notification.NotificationService;
import edu.cit.nursetracker.notification.NotificationType;
import edu.cit.nursetracker.user.User;
import edu.cit.nursetracker.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ClinicalCaseService {

    private final ClinicalCaseRepository caseRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public ClinicalCase submitCase(ClinicalCase clinicalCase) {
        clinicalCase.setStatus(CaseStatus.PENDING);
        return caseRepository.save(clinicalCase);
    }

    public List<ClinicalCase> getStudentCases(Long studentId) {
        return caseRepository.findByStudentIdOrderByCaseDateDesc(studentId);
    }

    public List<ClinicalCase> getAllCases() {
        return caseRepository.findAllByOrderByCaseDateDesc();
    }

    public List<ClinicalCase> getCasesVisibleTo(Long viewerId) {
        Set<Integer> visibleLevels = userRepository.findById(viewerId)
                .map(User::getAssignedLevels)
                .orElse(Set.of());
        if (visibleLevels.isEmpty()) return List.of();
        return getAllCases().stream()
                .filter(clinicalCase -> intersects(clinicalCase.getStudent().getAssignedLevels(), visibleLevels) || intersects(clinicalCase.getInstructor().getAssignedLevels(), visibleLevels))
                .toList();
    }

    private boolean intersects(Set<Integer> recordLevels, Set<Integer> visibleLevels) {
        if (recordLevels == null || recordLevels.isEmpty()) return false;
        Set<Integer> overlap = new HashSet<>(recordLevels);
        overlap.retainAll(visibleLevels);
        return !overlap.isEmpty();
    }

    public List<RequirementProgressGroup> getStudentRequirementProgress(Long studentId) {
        List<ClinicalCase> records = getStudentCases(studentId);
        return List.of(
                new RequirementProgressGroup("DR", "Delivery Room Cases", List.of(
                        requirementItem(records, "Handled Cases", "Handled Case", 3),
                        requirementItem(records, "Assisted Cases", "Assisted Case", 3),
                        requirementItem(records, "Newborn Care", "Newborn Care", 3),
                        requirementItem(records, "Labor Watch", "Labor Watch", 3)
                )),
                new RequirementProgressGroup("OR", "Operating Room Cases", List.of(
                        requirementItem(records, "Minor Cases", "Minor Case", 3),
                        requirementItem(records, "Major Cases - Scrub", "Major Case - Scrub", 3),
                        requirementItem(records, "Major Cases - Circulating", "Major Case - Circulating", 3)
                ))
        );
    }

    private RequirementProgressItem requirementItem(List<ClinicalCase> records, String label, String alternateLabel, long total) {
        long completed = records.stream()
                .filter(clinicalCase -> clinicalCase.getStatus() == CaseStatus.APPROVED)
                .filter(clinicalCase -> labelMatches(clinicalCase.getCategory(), label, alternateLabel))
                .count();
        return new RequirementProgressItem(label, Math.min(completed, total), total);
    }

    private boolean labelMatches(String value, String label, String alternateLabel) {
        if (value == null) return false;
        return value.equalsIgnoreCase(label) || value.equalsIgnoreCase(alternateLabel);
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
