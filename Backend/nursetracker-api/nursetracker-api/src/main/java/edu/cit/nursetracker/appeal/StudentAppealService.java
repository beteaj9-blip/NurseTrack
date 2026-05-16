package edu.cit.nursetracker.appeal;

import edu.cit.nursetracker.notification.Notification;
import edu.cit.nursetracker.notification.NotificationService;
import edu.cit.nursetracker.notification.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentAppealService {

    private final StudentAppealRepository appealRepository;
    private final NotificationService notificationService;

    public StudentAppeal createAppeal(StudentAppeal appeal) {
        appeal.setStatus(AppealStatus.PENDING);
        return appealRepository.save(appeal);
    }

    public List<StudentAppeal> getStudentAppeals(Long studentId) {
        return appealRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<StudentAppeal> getInstructorAppeals(Long instructorId) {
        return appealRepository.findByInstructorIdOrderByCreatedAtDesc(instructorId);
    }

    public StudentAppeal getAppeal(Long id) {
        return appealRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student appeal not found."));
    }

    public StudentAppeal updateAppeal(Long id, StudentAppeal updatedAppeal) {
        StudentAppeal appeal = getAppeal(id);
        appeal.setInstructor(updatedAppeal.getInstructor());
        appeal.setAppealType(updatedAppeal.getAppealType());
        appeal.setRelatedDutyDate(updatedAppeal.getRelatedDutyDate());
        appeal.setClinicalSite(updatedAppeal.getClinicalSite());
        appeal.setDutyArea(updatedAppeal.getDutyArea());
        appeal.setTitle(updatedAppeal.getTitle());
        appeal.setStudentReason(updatedAppeal.getStudentReason());
        appeal.setEvidenceNotes(updatedAppeal.getEvidenceNotes());
        appeal.setSupportingFiles(updatedAppeal.getSupportingFiles());
        appeal.setStatus(AppealStatus.PENDING);
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
                .message("Your appeal \"" + saved.getTitle() + "\" was " + status.name().toLowerCase() + ".")
                .type(status == AppealStatus.ACCEPTED ? NotificationType.APPROVAL : NotificationType.RETURNED)
                .actionUrl("/nursing-student/appeals")
                .build());
        return saved;
    }
}
