package edu.cit.nursetracker.duty;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DutyRepository extends JpaRepository<DutyRecord, Long> {
    List<DutyRecord> findByStudentIdOrderByTimeInDesc(Long studentId);
    List<DutyRecord> findByInstructorIdOrderByTimeInDesc(Long instructorId);
    List<DutyRecord> findByStatus(DutyStatus status);
}
