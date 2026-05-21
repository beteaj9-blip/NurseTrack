package edu.cit.nursetracker.duty;

import edu.cit.nursetracker.schedule.Schedule;
import edu.cit.nursetracker.schedule.ScheduleRepository;
import edu.cit.nursetracker.user.AccessScope;
import edu.cit.nursetracker.user.User;
import edu.cit.nursetracker.user.UserRepository;
import edu.cit.nursetracker.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Duration;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DutyService {

    private final DutyRepository dutyRepository;
    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;

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
        return userRepository.findById(viewerId)
                .map(viewer -> getAllDuties().stream()
                        .filter(record -> AccessScope.canViewRecord(viewer, record.getStudent(), record.getInstructor()))
                        .toList())
                .orElse(List.of());
    }

    public DutyAttendanceTodayResponse getTodayAttendance(Long userId, Long scheduleId) {
        User viewer = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        LocalDate today = LocalDate.now();
        List<Schedule> schedules = getTodaySchedulesForViewer(viewer, today);

        List<Schedule> scheduleOptions = uniqueScheduleSessions(schedules);
        return findRequestedSchedule(scheduleOptions, scheduleId)
                .map(schedule -> buildAttendanceResponse(schedule, viewer.getRole() == UserRole.STUDENT ? userId : null, scheduleOptions))
                .orElse(DutyAttendanceTodayResponse.empty());
    }

    public DutyAttendanceTodayResponse timeInForToday(Long userId, Long scheduleId) {
        User student = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        if (student.getRole() != UserRole.STUDENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only students can check in.");
        }

        LocalDate today = LocalDate.now();
        List<Schedule> todaysSchedules = scheduleRepository.findByStudentIdAndShiftDateAndCanceledFalseOrderByStartTimeAsc(userId, today);
        Schedule schedule = findRequestedSchedule(todaysSchedules, scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No duty schedule today."));

        Optional<DutyRecord> existingRecord = dutyRepository.findFirstByScheduleIdOrderByTimeInAsc(schedule.getId());

        if (existingRecord.isEmpty()) {
            dutyRepository.save(DutyRecord.builder()
                    .student(schedule.getStudent())
                    .instructor(schedule.getInstructor())
                    .schedule(schedule)
                    .hospital(schedule.getHospital())
                    .ward(schedule.getWard())
                    .timeIn(LocalDateTime.now())
                    .status(DutyStatus.PENDING)
                    .build());
        }

        return buildAttendanceResponse(schedule, userId, uniqueScheduleSessions(todaysSchedules));
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

    private Optional<Schedule> selectCurrentSchedule(List<Schedule> schedules) {
        if (schedules.isEmpty()) return Optional.empty();

        LocalTime now = LocalTime.now();
        return schedules.stream()
                .filter(schedule -> !now.isBefore(schedule.getStartTime()) && !now.isAfter(schedule.getEndTime()))
                .findFirst()
                .or(() -> schedules.stream().filter(schedule -> now.isBefore(schedule.getStartTime())).findFirst())
                .or(() -> schedules.stream().max(Comparator.comparing(Schedule::getStartTime)));
    }

    private Optional<Schedule> findRequestedSchedule(List<Schedule> schedules, Long scheduleId) {
        if (scheduleId != null) {
            return schedules.stream().filter(schedule -> schedule.getId().equals(scheduleId)).findFirst();
        }
        return selectCurrentSchedule(schedules);
    }

    private List<Schedule> getTodaySchedulesForViewer(User viewer, LocalDate today) {
        if (viewer.getRole() == UserRole.STUDENT) {
            return scheduleRepository.findByStudentIdAndShiftDateAndCanceledFalseOrderByStartTimeAsc(viewer.getId(), today);
        }

        if (viewer.getRole() == UserRole.INSTRUCTOR) {
            return scheduleRepository.findByInstructorIdAndShiftDateAndCanceledFalseOrderByStartTimeAsc(viewer.getId(), today);
        }

        return scheduleRepository.findAll().stream()
                .filter(schedule -> schedule.getShiftDate().equals(today))
                .filter(schedule -> !Boolean.TRUE.equals(schedule.getCanceled()))
                .filter(schedule -> AccessScope.canViewRecord(viewer, schedule.getStudent(), schedule.getInstructor()))
                .sorted(Comparator.comparing(Schedule::getStartTime).thenComparing(Schedule::getWard, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    private List<Schedule> uniqueScheduleSessions(List<Schedule> schedules) {
        return schedules.stream()
                .collect(Collectors.toMap(this::scheduleSessionKey, Function.identity(), (first, second) -> first))
                .values()
                .stream()
                .sorted(Comparator.comparing(Schedule::getStartTime).thenComparing(Schedule::getWard, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    private String scheduleSessionKey(Schedule schedule) {
        return String.join("|",
                String.valueOf(schedule.getInstructor().getId()),
                schedule.getHospital().toLowerCase(),
                schedule.getWard().toLowerCase(),
                schedule.getShiftDate().toString(),
                schedule.getStartTime().toString(),
                schedule.getEndTime().toString()
        );
    }

    private DutyAttendanceTodayResponse buildAttendanceResponse(Schedule schedule, Long currentStudentId, List<Schedule> scheduleOptions) {
        List<Schedule> rosterSchedules = scheduleRepository.findByInstructorIdAndHospitalIgnoreCaseAndWardIgnoreCaseAndShiftDateAndStartTimeAndEndTimeAndCanceledFalse(
                schedule.getInstructor().getId(),
                schedule.getHospital(),
                schedule.getWard(),
                schedule.getShiftDate(),
                schedule.getStartTime(),
                schedule.getEndTime()
        );

        List<DutyAttendanceStudent> students = rosterSchedules.stream()
                .map(Schedule::getStudent)
                .filter(this::isStudent)
                .collect(Collectors.toMap(User::getId, Function.identity(), (first, second) -> first))
                .values()
                .stream()
                .sorted(Comparator.comparing(User::getFullName, String.CASE_INSENSITIVE_ORDER))
                .map(student -> toStudentDto(student, null))
                .toList();

        List<Long> rosterScheduleIds = rosterSchedules.stream().map(Schedule::getId).toList();
        List<Long> studentIds = students.stream().map(DutyAttendanceStudent::studentId).toList();
        Map<Long, DutyRecord> presentRecords = dutyRepository.findByScheduleIdInOrderByTimeInAsc(rosterScheduleIds)
                .stream()
                .filter(record -> isStudent(record.getStudent()))
                .filter(record -> studentIds.contains(record.getStudent().getId()))
                .collect(Collectors.toMap(record -> record.getStudent().getId(), Function.identity(), (first, second) -> first));

        List<DutyAttendanceStudent> presentStudents = rosterSchedules.stream()
                .map(Schedule::getStudent)
                .filter(this::isStudent)
                .filter(student -> presentRecords.containsKey(student.getId()))
                .collect(Collectors.toMap(User::getId, Function.identity(), (first, second) -> first))
                .values()
                .stream()
                .sorted(Comparator.comparing(User::getFullName, String.CASE_INSENSITIVE_ORDER))
                .map(student -> toStudentDto(student, presentRecords.get(student.getId()).getTimeIn().toString()))
                .toList();

        boolean checkedIn = currentStudentId != null && presentRecords.containsKey(currentStudentId);

        return new DutyAttendanceTodayResponse(
                true,
                schedule.getId(),
                schedule.getHospital(),
                schedule.getWard(),
                schedule.getShiftDate(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getInstructor().getId(),
                schedule.getInstructor().getFullName(),
                students.size(),
                presentStudents.size(),
                checkedIn,
                scheduleOptions.stream().map(this::toScheduleOption).toList(),
                students,
                presentStudents
        );
    }

    private DutyAttendanceStudent toStudentDto(User student, String timeIn) {
        return new DutyAttendanceStudent(
                student.getId(),
                student.getSchoolId(),
                student.getFullName(),
                student.getSectionInfo(),
                student.getProfileImageUrl(),
                timeIn
        );
    }

    private DutyAttendanceScheduleOption toScheduleOption(Schedule schedule) {
        int rosterCount = scheduleRepository.findByInstructorIdAndHospitalIgnoreCaseAndWardIgnoreCaseAndShiftDateAndStartTimeAndEndTimeAndCanceledFalse(
                schedule.getInstructor().getId(),
                schedule.getHospital(),
                schedule.getWard(),
                schedule.getShiftDate(),
                schedule.getStartTime(),
                schedule.getEndTime()
        ).stream()
                .map(Schedule::getStudent)
                .filter(this::isStudent)
                .collect(Collectors.toMap(User::getId, Function.identity(), (first, second) -> first))
                .size();

        return new DutyAttendanceScheduleOption(
                schedule.getId(),
                schedule.getHospital(),
                schedule.getWard(),
                schedule.getShiftDate(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getInstructor().getId(),
                schedule.getInstructor().getFullName(),
                rosterCount
        );
    }

    private boolean isStudent(User user) {
        return user != null && user.getRole() == UserRole.STUDENT;
    }
}
