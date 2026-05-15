package edu.cit.nursetracker.schedule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByStudentIdOrderByShiftDateAsc(Long studentId);
    List<Schedule> findByInstructorIdOrderByShiftDateAsc(Long instructorId);
}
