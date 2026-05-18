package edu.cit.nursetracker.schedule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDate;
import java.time.LocalTime;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByStudentIdOrderByShiftDateAsc(Long studentId);
    List<Schedule> findByInstructorIdOrderByShiftDateAsc(Long instructorId);
    boolean existsByStudentIdAndInstructorIdAndHospitalIgnoreCaseAndWardIgnoreCaseAndShiftDateAndStartTimeAndEndTime(
            Long studentId,
            Long instructorId,
            String hospital,
            String ward,
            LocalDate shiftDate,
            LocalTime startTime,
            LocalTime endTime
    );
}
