package edu.cit.nursetracker.schedule;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    public Schedule assignSchedule(Schedule schedule) {
        return scheduleRepository.save(schedule);
    }

    public List<Schedule> getStudentSchedules(Long studentId) {
        return scheduleRepository.findByStudentIdOrderByShiftDateAsc(studentId);
    }

    public List<Schedule> getInstructorSchedules(Long instructorId) {
        return scheduleRepository.findByInstructorIdOrderByShiftDateAsc(instructorId);
    }

    public void unassignSchedule(Long scheduleId) {
        scheduleRepository.deleteById(scheduleId);
    }

    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }
}
