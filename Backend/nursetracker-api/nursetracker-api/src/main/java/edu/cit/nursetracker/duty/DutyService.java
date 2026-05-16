package edu.cit.nursetracker.duty;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DutyService {

    private final DutyRepository dutyRepository;

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
