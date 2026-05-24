package edu.cit.nursetracker.schedule;

import edu.cit.nursetracker.user.AccessScope;
import edu.cit.nursetracker.user.User;
import edu.cit.nursetracker.user.UserRepository;
import edu.cit.nursetracker.user.UserRole;
import edu.cit.nursetracker.duty.DutyRepository;
import edu.cit.nursetracker.duty.DutyRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final DutyRepository dutyRepository;

    public Schedule assignSchedule(Schedule schedule) {
        updateStudentSectionAndGroup(schedule.getStudent());
        schedule.setGroupName(resolveStudentGroupName(schedule.getStudent()));
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
            List<DutyRecord> dutyRecords = dutyRepository.findByScheduleIdInOrderByTimeInAsc(List.of(scheduleId));
            for (DutyRecord record : dutyRecords) {
                record.setSchedule(null);
                dutyRepository.save(record);
            }
            scheduleRepository.delete(schedule);
        });
    }

    public Schedule updateSchedule(Long scheduleId, Schedule updatedSchedule) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found."));
        if (updatedSchedule.getStudent() != null) {
            schedule.setStudent(updatedSchedule.getStudent());
            updateStudentSectionAndGroup(updatedSchedule.getStudent());
        }
        if (updatedSchedule.getInstructor() != null) schedule.setInstructor(updatedSchedule.getInstructor());
        schedule.setHospital(updatedSchedule.getHospital());
        schedule.setWard(updatedSchedule.getWard());
        schedule.setShiftDate(updatedSchedule.getShiftDate());
        schedule.setStartTime(updatedSchedule.getStartTime());
        schedule.setEndTime(updatedSchedule.getEndTime());
        schedule.setGroupName(resolveStudentGroupName(schedule.getStudent()));
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

    private void updateStudentSectionAndGroup(User studentPayload) {
        if (studentPayload != null && studentPayload.getId() != null) {
            userRepository.findById(studentPayload.getId()).ifPresent(student -> {
                if (studentPayload.getSectionInfo() != null && !studentPayload.getSectionInfo().isBlank()) {
                    String fullSection = studentPayload.getSectionInfo().trim();
                    java.util.regex.Matcher groupMatcher = java.util.regex.Pattern.compile("(?i)\\b(g\\s*\\d+[a-z]?)\\b").matcher(fullSection);
                    if (groupMatcher.find()) {
                        String group = groupMatcher.group(1).replaceAll("\\s+", "").toUpperCase();
                        String section = fullSection.replace(groupMatcher.group(0), "").replaceAll("[-–—]", " ").replaceAll("\\s+", " ").trim();
                        student.setSectionInfo(section);
                        student.setGroupInfo(group);
                    } else {
                        student.setSectionInfo(fullSection);
                    }
                    userRepository.save(student);
                }
            });
        }
    }

    private String resolveStudentGroupName(User studentPayload) {
        if (studentPayload == null) return null;
        if (studentPayload.getId() != null) {
            return userRepository.findById(studentPayload.getId())
                    .map(User::getGroupInfo)
                    .filter(group -> group != null && !group.isBlank())
                    .orElse(null);
        }
        return studentPayload.getGroupInfo() != null && !studentPayload.getGroupInfo().isBlank()
                ? studentPayload.getGroupInfo().trim()
                : null;
    }
}
