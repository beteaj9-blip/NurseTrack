package edu.cit.nursetracker.schedule;

import edu.cit.nursetracker.user.AccessScope;
import edu.cit.nursetracker.user.UserRepository;
import edu.cit.nursetracker.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;

    public Schedule assignSchedule(Schedule schedule) {
        return scheduleRepository.save(schedule);
    }

    public List<Schedule> getStudentSchedules(Long studentId) {
        return scheduleRepository.findByStudentIdOrderByShiftDateAsc(studentId);
    }

    public List<Schedule> getInstructorSchedules(Long instructorId) {
        return scheduleRepository.findByInstructorIdOrderByShiftDateAsc(instructorId);
    }

    public List<Schedule> getMobileSchedules(Long viewerId) {
        return userRepository.findById(viewerId)
                .map(viewer -> viewer.getRole() == UserRole.STUDENT ? getStudentSchedules(viewerId) : getInstructorSchedules(viewerId))
                .orElse(List.of());
    }

    public void unassignSchedule(Long scheduleId) {
        scheduleRepository.findById(scheduleId).ifPresent(schedule -> {
            schedule.setCanceled(true);
            scheduleRepository.save(schedule);
        });
    }

    public Schedule updateSchedule(Long scheduleId, Schedule updatedSchedule) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found."));
        if (updatedSchedule.getStudent() != null) schedule.setStudent(updatedSchedule.getStudent());
        if (updatedSchedule.getInstructor() != null) schedule.setInstructor(updatedSchedule.getInstructor());
        schedule.setHospital(updatedSchedule.getHospital());
        schedule.setWard(updatedSchedule.getWard());
        schedule.setShiftDate(updatedSchedule.getShiftDate());
        schedule.setStartTime(updatedSchedule.getStartTime());
        schedule.setEndTime(updatedSchedule.getEndTime());
        if (updatedSchedule.getCanceled() != null) schedule.setCanceled(updatedSchedule.getCanceled());
        return scheduleRepository.save(schedule);
    }

    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public List<Schedule> getSchedulesForViewer(Long viewerId) {
        return userRepository.findById(viewerId)
                .map(viewer -> AccessScope.canViewAll(viewer) ? getAllSchedules() : getSchedulesVisibleTo(viewerId))
                .orElse(List.of());
    }

    public List<Schedule> getSchedulesVisibleTo(Long viewerId) {
        return userRepository.findById(viewerId)
                .map(viewer -> getAllSchedules().stream()
                        .filter(schedule -> AccessScope.canViewRecord(viewer, schedule.getStudent(), schedule.getInstructor()))
                        .toList())
                .orElse(List.of());
    }
}
