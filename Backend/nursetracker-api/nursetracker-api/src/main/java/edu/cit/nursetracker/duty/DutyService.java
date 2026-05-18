package edu.cit.nursetracker.duty;

import edu.cit.nursetracker.user.User;
import edu.cit.nursetracker.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DutyService {

    private final DutyRepository dutyRepository;
    private final UserRepository userRepository;

    public DutyRecord timeIn(DutyRecord record) {
        record.setTimeIn(LocalDateTime.now());
        record.setStatus(DutyStatus.PENDING);
        return dutyRepository.save(record);
    }

    public DutyRecord manualEntry(DutyRecord record) {
        if (record.getTimeIn() != null && record.getTimeOut() != null) {
            long minutes = Duration.between(record.getTimeIn(), record.getTimeOut()).toMinutes();
            record.setTotalHours(minutes / 60.0);
        }
        record.setStatus(DutyStatus.PENDING);
        return dutyRepository.save(record);
    }

    public DutyRecord updateManualEntry(Long recordId, DutyRecord updatedRecord) {
        DutyRecord record = dutyRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Duty log not found."));

        record.setHospital(updatedRecord.getHospital());
        record.setWard(updatedRecord.getWard());
        record.setTimeIn(updatedRecord.getTimeIn());
        record.setTimeOut(updatedRecord.getTimeOut());
        record.setInstructorFeedback(updatedRecord.getInstructorFeedback());
        if (record.getTimeIn() != null && record.getTimeOut() != null) {
            long minutes = Duration.between(record.getTimeIn(), record.getTimeOut()).toMinutes();
            record.setTotalHours(minutes / 60.0);
        }
        record.setStatus(DutyStatus.PENDING);
        return dutyRepository.save(record);
    }

    public DutyRecord timeOut(Long recordId) {
        DutyRecord record = dutyRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Duty log not found."));
        
        record.setTimeOut(LocalDateTime.now());
        
        if (record.getTimeIn() != null) {
            long minutes = Duration.between(record.getTimeIn(), record.getTimeOut()).toMinutes();
            record.setTotalHours(minutes / 60.0);
        }
        
        return dutyRepository.save(record);
    }

    public List<DutyRecord> getStudentDuties(Long studentId) {
        return dutyRepository.findByStudentIdOrderByTimeInDesc(studentId);
    }

    public List<DutyRecord> getInstructorValidations(Long instructorId) {
        return dutyRepository.findByInstructorIdOrderByTimeInDesc(instructorId);
    }

    public List<DutyRecord> getAllDuties() {
        return dutyRepository.findAll();
    }

    public List<DutyRecord> getDutiesVisibleTo(Long viewerId) {
        Set<Integer> visibleLevels = userRepository.findById(viewerId).map(User::getAssignedLevels).orElse(Set.of());
        if (visibleLevels.isEmpty()) return List.of();
        return getAllDuties().stream()
                .filter(record -> intersects(record.getStudent().getAssignedLevels(), visibleLevels) || intersects(record.getInstructor().getAssignedLevels(), visibleLevels))
                .toList();
    }

    private boolean intersects(Set<Integer> recordLevels, Set<Integer> visibleLevels) {
        if (recordLevels == null || recordLevels.isEmpty()) return false;
        Set<Integer> overlap = new HashSet<>(recordLevels);
        overlap.retainAll(visibleLevels);
        return !overlap.isEmpty();
    }

    public DutyRecord validateDuty(Long recordId, DutyStatus status, String feedback) {
        DutyRecord record = dutyRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Duty log not found."));
        
        record.setStatus(status);
        if (feedback != null) {
            record.setInstructorFeedback(feedback);
        }
        return dutyRepository.save(record);
    }
}
