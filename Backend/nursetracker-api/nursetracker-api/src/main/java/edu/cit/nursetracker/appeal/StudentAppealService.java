package edu.cit.nursetracker.appeal;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentAppealService {

    private final StudentAppealRepository appealRepository;

    public StudentAppeal createAppeal(StudentAppeal appeal) {
        appeal.setStatus(AppealStatus.PENDING);
        return appealRepository.save(appeal);
    }

    public List<StudentAppeal> getStudentAppeals(Long studentId) {
        return appealRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public StudentAppeal getAppeal(Long id) {
        return appealRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student appeal not found."));
    }

    public StudentAppeal updateAppealStatus(Long id, AppealStatus status, String instructorRemarks) {
        StudentAppeal appeal = getAppeal(id);
        appeal.setStatus(status);
        if (instructorRemarks != null) {
            appeal.setInstructorRemarks(instructorRemarks);
        }
        return appealRepository.save(appeal);
    }
}
