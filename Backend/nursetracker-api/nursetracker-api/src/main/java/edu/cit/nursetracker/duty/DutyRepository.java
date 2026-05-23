package edu.cit.nursetracker.duty;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DutyRepository extends JpaRepository<DutyRecord, Long> {
    List<DutyRecord> findByStudentIdOrderByTimeInDesc(Long studentId);
    List<DutyRecord> findByInstructorIdOrderByTimeInDesc(Long instructorId);
    List<DutyRecord> findByStatus(DutyStatus status);
    List<DutyRecord> findByScheduleIdInOrderByTimeInAsc(List<Long> scheduleIds);
    Optional<DutyRecord> findFirstByScheduleIdOrderByTimeInAsc(Long scheduleId);
    Optional<DutyRecord> findFirstByScheduleIdAndStudentIdOrderByTimeInAsc(Long scheduleId, Long studentId);
    List<DutyRecord> findByInstructorIdAndHospitalIgnoreCaseAndWardIgnoreCaseAndTimeInBetweenOrderByTimeInAsc(
            Long instructorId,
            String hospital,
            String ward,
            LocalDateTime start,
            LocalDateTime end
    );
    Optional<DutyRecord> findFirstByStudentIdAndInstructorIdAndHospitalIgnoreCaseAndWardIgnoreCaseAndTimeInBetweenOrderByTimeInAsc(
            Long studentId,
            Long instructorId,
            String hospital,
            String ward,
            LocalDateTime start,
            LocalDateTime end
    );
}
