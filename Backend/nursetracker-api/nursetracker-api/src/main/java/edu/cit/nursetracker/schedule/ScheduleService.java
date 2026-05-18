package edu.cit.nursetracker.schedule;

import edu.cit.nursetracker.user.User;
import edu.cit.nursetracker.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    public void unassignSchedule(Long scheduleId) {
        scheduleRepository.deleteById(scheduleId);
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
        return scheduleRepository.save(schedule);
    }

    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public List<Schedule> getSchedulesForViewer(Long viewerId) {
        return userRepository.findById(viewerId)
                .map(viewer -> viewer.getRole() == edu.cit.nursetracker.user.UserRole.ADMIN ? getAllSchedules() : getSchedulesVisibleTo(viewerId))
                .orElse(List.of());
    }

    public List<Schedule> getSchedulesVisibleTo(Long viewerId) {
        Set<Integer> visibleLevels = userRepository.findById(viewerId).map(User::getAssignedLevels).orElse(Set.of());
        if (visibleLevels.isEmpty()) return List.of();
        return getAllSchedules().stream()
                .filter(schedule -> intersects(schedule.getStudent().getAssignedLevels(), visibleLevels) || intersects(schedule.getInstructor().getAssignedLevels(), visibleLevels))
                .toList();
    }

    private boolean intersects(Set<Integer> recordLevels, Set<Integer> visibleLevels) {
        if (recordLevels == null || recordLevels.isEmpty()) return false;
        Set<Integer> overlap = new HashSet<>(recordLevels);
        overlap.retainAll(visibleLevels);
        return !overlap.isEmpty();
    }
}
