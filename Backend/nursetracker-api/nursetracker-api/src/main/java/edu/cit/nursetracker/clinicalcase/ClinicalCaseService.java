package edu.cit.nursetracker.clinicalcase;

import edu.cit.nursetracker.notification.Notification;
import edu.cit.nursetracker.notification.NotificationService;
import edu.cit.nursetracker.notification.NotificationType;
import edu.cit.nursetracker.adminaccess.AdminAccessPermissionService;
import edu.cit.nursetracker.user.AccessScope;
import edu.cit.nursetracker.user.UserRepository;
import edu.cit.nursetracker.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ClinicalCaseService {

    private final ClinicalCaseRepository caseRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public ClinicalCase submitCase(ClinicalCase clinicalCase) {
        validateRequirementLimit(clinicalCase, null);
        clinicalCase.setStatus(CaseStatus.PENDING);
        return caseRepository.save(clinicalCase);
    }

    public List<ClinicalCase> getStudentCases(Long studentId) {
        return caseRepository.findByStudentIdOrderByCaseDateDesc(studentId);
    }

    public List<ClinicalCase> getAllCases() {
        return caseRepository.findAllByOrderByCaseDateDesc().stream()
                .filter(c -> c.getStudent() != null && c.getStudent().getRole() == UserRole.STUDENT)
                .toList();
    }

    public List<ClinicalCase> getCasesVisibleTo(Long viewerId) {
        return userRepository.findById(viewerId)
                .map(viewer -> getAllCases().stream()
                        .filter(clinicalCase -> AccessScope.canViewRecord(viewer, clinicalCase.getStudent(), clinicalCase.getInstructor()))
                        .toList())
                .orElse(List.of());
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
                        requirementItem(records, "Major Cases - Assist", "Major Case - Assist", 3),
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
        return caseRepository.findByInstructorIdOrderByCaseDateDesc(instructorId).stream()
                .filter(c -> c.getStudent() != null && c.getStudent().getRole() == UserRole.STUDENT)
                .toList();
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

    public boolean canValidateCase(Long caseId, Long viewerId, AdminAccessPermissionService accessPermissionService) {
        ClinicalCase clinicalCase = caseRepository.findById(caseId).orElse(null);
        if (clinicalCase == null) return false;
        return userRepository.findById(viewerId)
                .filter(viewer -> viewer.getRole() == UserRole.INSTRUCTOR && clinicalCase.getInstructor() != null && clinicalCase.getInstructor().getId().equals(viewer.getId())
                        || AccessScope.canViewRecord(viewer, clinicalCase.getStudent(), clinicalCase.getInstructor()))
                .filter(viewer -> accessPermissionService.canEdit(viewer.getRole(), "clinicalCases"))
                .isPresent();
    }

    public ClinicalCase getCaseById(Long id) {
        return caseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clinical Case not found."));
    }

    public ClinicalCase updateCase(Long id, ClinicalCase updatedCase, Long currentUserId) {
        ClinicalCase existingCase = getCaseById(id);
        if (existingCase != null) {
            validateStudentPendingMutation(existingCase, currentUserId, "edit");
            validateRequirementLimit(updatedCase, existingCase.getId());
            existingCase.setCaseType(updatedCase.getCaseType());
            existingCase.setDiagnosis(updatedCase.getDiagnosis());
            existingCase.setProcedureDetails(updatedCase.getProcedureDetails());
            existingCase.setPatientInitials(updatedCase.getPatientInitials());
            existingCase.setCategory(updatedCase.getCategory());
            existingCase.setStudentReflection(updatedCase.getStudentReflection());
            existingCase.setStatus(CaseStatus.PENDING);
            return caseRepository.save(existingCase);
        }
        return null;
    }

    public void deleteCase(Long id, Long currentUserId) {
        ClinicalCase existingCase = getCaseById(id);
        validateStudentPendingMutation(existingCase, currentUserId, "delete");
        caseRepository.delete(existingCase);
    }

    private void validateStudentPendingMutation(ClinicalCase existingCase, Long currentUserId, String action) {
        if (!existingCase.getStudent().getId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only " + action + " your own clinical cases.");
        }
        if (existingCase.getStatus() != CaseStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending clinical cases can be " + action + (action.endsWith("e") ? "d." : "ed."));
        }
    }

    private void validateRequirementLimit(ClinicalCase clinicalCase, Long excludedCaseId) {
        if (clinicalCase.getStudent() == null || clinicalCase.getStudent().getId() == null) return;
        String category = clinicalCase.getCategory();
        long limit = requirementLimit(category);
        if (limit <= 0) return;
        long existingCount = caseRepository.findByStudentIdOrderByCaseDateDesc(clinicalCase.getStudent().getId()).stream()
                .filter(record -> excludedCaseId == null || !record.getId().equals(excludedCaseId))
                .filter(record -> record.getStatus() != CaseStatus.RETURNED)
                .filter(record -> labelMatches(record.getCategory(), category, displayRequirementLabel(category)))
                .count();
        if (existingCount >= limit) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, displayRequirementLabel(category) + " is limited to " + limit + " submitted case(s).");
        }
    }

    private long requirementLimit(String category) {
        if (category == null) return 0;
        return switch (category.toLowerCase()) {
            case "handled cases", "handled case", "assisted cases", "assisted case", "newborn care", "labor watch", "major cases - assist", "major case - assist", "major cases - scrub", "major case - scrub", "major cases - circulating", "major case - circulating" -> 3;
            default -> 0;
        };
    }

    private String displayRequirementLabel(String category) {
        if (category == null) return "Clinical case";
        return switch (category) {
            case "Handled Cases" -> "Handled Case";
            case "Assisted Cases" -> "Assisted Case";
            case "Major Cases - Assist" -> "Major Case - Assist";
            case "Major Cases - Scrub" -> "Major Case - Scrub";
            case "Major Cases - Circulating" -> "Major Case - Circulate";
            default -> category;
        };
    }
}
