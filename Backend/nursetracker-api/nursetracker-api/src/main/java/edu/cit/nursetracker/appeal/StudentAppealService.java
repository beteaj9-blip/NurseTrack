package edu.cit.nursetracker.appeal;

import edu.cit.nursetracker.notification.Notification;
import edu.cit.nursetracker.notification.NotificationService;
import edu.cit.nursetracker.notification.NotificationType;
import edu.cit.nursetracker.user.AccessScope;
import edu.cit.nursetracker.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentAppealService {

    private final StudentAppealRepository appealRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public StudentAppeal createAppeal(StudentAppeal appeal) {
        syncAppealText(appeal);
        validateAppeal(appeal);
        appeal.setAppealType(clean(appeal.getAppealType()));
        appeal.setStatus(AppealStatus.PENDING);
        appeal.setInstructorDecision(null);
        return appealRepository.save(appeal);
    }

    public List<StudentAppeal> getStudentAppeals(Long studentId) {
        return appealRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<StudentAppeal> getAllAppeals() {
        return appealRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<StudentAppeal> getAppealsVisibleTo(Long viewerId) {
        return userRepository.findById(viewerId)
                .map(viewer -> getAllAppeals().stream()
                        .filter(appeal -> AccessScope.canViewRecord(viewer, appeal.getStudent(), appeal.getInstructor()))
                        .toList())
                .orElse(List.of());
    }

    public List<StudentAppeal> getInstructorAppeals(Long instructorId) {
        return appealRepository.findByInstructorIdOrderByCreatedAtDesc(instructorId);
    }

    public StudentAppeal getAppeal(Long id) {
        return appealRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student appeal not found."));
    }

    public StudentAppeal updateAppeal(Long id, StudentAppeal updatedAppeal) {
        syncAppealText(updatedAppeal);
        validateAppeal(updatedAppeal);
        StudentAppeal appeal = getAppeal(id);
        appeal.setInstructor(updatedAppeal.getInstructor());
        appeal.setAppealType(clean(updatedAppeal.getAppealType()));
        appeal.setRelatedDutyDate(updatedAppeal.getRelatedDutyDate());
        appeal.setClinicalSite(updatedAppeal.getClinicalSite());
        appeal.setDutyArea(updatedAppeal.getDutyArea());
        appeal.setSubject(updatedAppeal.getSubject());
        appeal.setTitle(updatedAppeal.getTitle());
        appeal.setDetails(updatedAppeal.getDetails());
        appeal.setStudentReason(updatedAppeal.getStudentReason());
        appeal.setEvidenceNotes(updatedAppeal.getEvidenceNotes());
        appeal.setSupportingFiles(updatedAppeal.getSupportingFiles());
        appeal.setSupportingFileName(updatedAppeal.getSupportingFileName());
        appeal.setStatus(AppealStatus.PENDING);
        appeal.setInstructorDecision(null);
        appeal.setInstructorRemarks(null);
        return appealRepository.save(appeal);
    }

    public StudentAppeal updateAppealStatus(Long id, AppealStatus status, String instructorRemarks) {
        StudentAppeal appeal = getAppeal(id);
        appeal.setStatus(status);
        if (instructorRemarks != null) {
            appeal.setInstructorRemarks(instructorRemarks);
        }
        StudentAppeal saved = appealRepository.save(appeal);
        notificationService.createNotification(Notification.builder()
                .user(saved.getStudent())
                .title(status == AppealStatus.ACCEPTED ? "Appeal accepted" : "Appeal rejected")
                .message("Your appeal \"" + saved.getSubject() + "\" was " + status.name().toLowerCase() + ".")
                .type(status == AppealStatus.ACCEPTED ? NotificationType.APPROVAL : NotificationType.RETURNED)
                .actionUrl("/nursing-student/appeals")
                .build());
        return saved;
    }

    public StudentAppeal updateInstructorRecommendation(Long id, AppealStatus instructorDecision, String instructorRemarks) {
        StudentAppeal appeal = getAppeal(id);
        appeal.setInstructorDecision(instructorDecision);
        appeal.setInstructorRemarks(instructorRemarks == null ? "" : instructorRemarks.trim());
        StudentAppeal saved = appealRepository.save(appeal);
        if (instructorDecision == AppealStatus.RETURNED) {
            notificationService.createNotification(Notification.builder()
                    .user(saved.getStudent())
                    .title("Appeal rejected by CI")
                    .message("Your appeal \"" + saved.getSubject() + "\" was rejected by your Clinical Instructor.")
                    .type(NotificationType.RETURNED)
                    .actionUrl("/nursing-student/appeals")
                    .build());
        }
        return saved;
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private void validateAppeal(StudentAppeal appeal) {
        if (appeal.getStudent() == null || appeal.getStudent().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student is required before submitting an appeal.");
        }
        if (clean(appeal.getAppealType()).isBlank() || clean(appeal.getClinicalSite()).isBlank() || clean(appeal.getDutyArea()).isBlank() || clean(appeal.getSubject()).isBlank() || clean(appeal.getDetails()).isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complete the required appeal details before submitting.");
        }
    }

    private void syncAppealText(StudentAppeal appeal) {
        if (clean(appeal.getSubject()).isBlank()) {
            appeal.setSubject(clean(appeal.getTitle()));
        }
        if (clean(appeal.getTitle()).isBlank()) {
            appeal.setTitle(clean(appeal.getSubject()));
        }
        if (clean(appeal.getDetails()).isBlank()) {
            appeal.setDetails(clean(appeal.getStudentReason()));
        }
        if (clean(appeal.getStudentReason()).isBlank()) {
            appeal.setStudentReason(clean(appeal.getDetails()));
        }
    }
}
