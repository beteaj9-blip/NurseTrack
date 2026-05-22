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
import java.time.ZoneId;
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

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Manila");

    private final DutyRepository dutyRepository;
    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;
    private final Map<String, Boolean> activeBroadcastingSignals = new java.util.concurrent.ConcurrentHashMap<>();

    public void setBroadcasting(Long scheduleId, boolean broadcasting) {
        scheduleRepository.findById(scheduleId).ifPresent(schedule -> 
            activeBroadcastingSignals.put(scheduleSessionKey(schedule), broadcasting)
        );
    }

    public DutyRecord timeIn(DutyRecord record) {
        record.setTimeIn(LocalDateTime.now(APP_ZONE));
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
        
        record.setTimeOut(LocalDateTime.now(APP_ZONE));
        
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

    public void deleteDutyRecord(Long id) {
        dutyRepository.deleteById(id);
    }

    public void resetTodayAttendanceForUser(Long userId) {
        LocalDate today = LocalDate.now(APP_ZONE);
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);
        List<DutyRecord> todaysRecords = dutyRepository.findByStudentIdOrderByTimeInDesc(userId)
                .stream()
                .filter(record -> record.getTimeIn() != null
                        && !record.getTimeIn().isBefore(startOfDay)
                        && !record.getTimeIn().isAfter(endOfDay))
                .toList();
        dutyRepository.deleteAll(todaysRecords);
    }

    public DutyAttendanceTodayResponse getTodayAttendance(Long userId, Long scheduleId, boolean isMobile) {
        User viewer = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        LocalDate today = LocalDate.now(APP_ZONE);
        List<Schedule> schedules = getTodaySchedulesForViewer(viewer, today, isMobile);

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

        LocalDate today = LocalDate.now(APP_ZONE);
        List<Schedule> todaysSchedules = scheduleRepository.findByStudentIdAndShiftDateAndCanceledFalseOrderByStartTimeAsc(userId, today);
        Schedule schedule = findRequestedSchedule(todaysSchedules, scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No duty schedule today."));

        Optional<DutyRecord> existingRecord = dutyRepository.findFirstByScheduleIdOrderByTimeInAsc(schedule.getId());

        if (existingRecord.isEmpty()) {
            LocalDateTime now = LocalDateTime.now(APP_ZONE);
            dutyRepository.save(DutyRecord.builder()
                    .student(schedule.getStudent())
                    .instructor(schedule.getInstructor())
                    .schedule(schedule)
                    .hospital(schedule.getHospital())
                    .ward(schedule.getWard())
                    .timeIn(now)
                    .status(DutyStatus.PENDING)
                    .build());
        }

        return buildAttendanceResponse(schedule, userId, uniqueScheduleSessions(todaysSchedules));
    }

    public DutyAttendanceTodayResponse timeOutForToday(Long userId, Long scheduleId) {
        User student = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        if (student.getRole() != UserRole.STUDENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only students can time out.");
        }

        LocalDate today = LocalDate.now(APP_ZONE);
        List<Schedule> todaysSchedules = scheduleRepository.findByStudentIdAndShiftDateAndCanceledFalseOrderByStartTimeAsc(userId, today);
        Schedule schedule = findRequestedSchedule(todaysSchedules, scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No duty schedule today."));

        if (LocalTime.now(APP_ZONE).isBefore(schedule.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Time out is not open yet.");
        }

        DutyRecord record = dutyRepository.findFirstByScheduleIdOrderByTimeInAsc(schedule.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Time in first before timing out."));

        if (record.getTimeOut() == null) {
            record.setTimeOut(LocalDateTime.now(APP_ZONE));
            long minutes = Duration.between(effectiveDutyStart(record, schedule), record.getTimeOut()).toMinutes();
            record.setTotalHours(minutes / 60.0);
            dutyRepository.save(record);
        }

        return buildAttendanceResponse(schedule, userId, uniqueScheduleSessions(todaysSchedules));
    }

    public DutyAttendanceTodayResponse submitAttendanceForToday(Long userId, Long scheduleId, boolean isMobile) {
        User viewer = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        if (viewer.getRole() == UserRole.STUDENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only duty hosts can submit attendance.");
        }

        LocalDate today = LocalDate.now(APP_ZONE);
        List<Schedule> schedules = getTodaySchedulesForViewer(viewer, today, isMobile);
        List<Schedule> scheduleOptions = uniqueScheduleSessions(schedules);
        Schedule schedule = findRequestedSchedule(scheduleOptions, scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No duty schedule today."));

        if (LocalTime.now(APP_ZONE).isBefore(schedule.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Attendance can be submitted after the scheduled time out.");
        }

        List<Schedule> rosterSchedules = getRosterSchedules(schedule);
        List<Long> rosterScheduleIds = rosterSchedules.stream().map(Schedule::getId).toList();
        List<DutyRecord> records = dutyRepository.findByScheduleIdInOrderByTimeInAsc(rosterScheduleIds);
        if (records.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No attendance records to submit.");
        }

        LocalDateTime submittedAt = LocalDateTime.now(APP_ZONE);
        records.forEach(record -> {
            record.setAttendanceSubmittedAt(submittedAt);
            if (record.getStatus() == DutyStatus.PENDING) {
                record.setStatus(DutyStatus.VERIFIED);
            }
        });
        dutyRepository.saveAll(records);

        return buildAttendanceResponse(schedule, null, scheduleOptions);
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

        LocalTime now = LocalTime.now(APP_ZONE);
        return schedules.stream()
                .filter(schedule -> !now.isBefore(schedule.getStartTime()) && !now.isAfter(schedule.getEndTime()))
                .findFirst()
                .or(() -> schedules.stream().filter(schedule -> now.isBefore(schedule.getStartTime())).findFirst())
                .or(() -> schedules.stream().max(Comparator.comparing(Schedule::getStartTime)));
    }

    private Optional<Schedule> findRequestedSchedule(List<Schedule> schedules, Long scheduleId) {
        if (scheduleId != null) {
            return schedules.stream()
                    .filter(schedule -> schedule.getId().equals(scheduleId) || getRepresentativeSchedule(schedule).getId().equals(scheduleId))
                    .findFirst();
        }
        return selectCurrentSchedule(schedules);
    }

    private List<Schedule> getTodaySchedulesForViewer(User viewer, LocalDate today, boolean isMobile) {
        if (viewer.getRole() == UserRole.STUDENT) {
            return scheduleRepository.findByStudentIdAndShiftDateAndCanceledFalseOrderByStartTimeAsc(viewer.getId(), today);
        }

        // On mobile, all non-student roles are treated as instructors: only see their own assigned schedules
        if (isMobile || viewer.getRole() == UserRole.INSTRUCTOR) {
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
                .map(this::getRepresentativeSchedule)
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
        List<Schedule> rosterSchedules = getRosterSchedules(schedule);

        List<User> rosterStudents = rosterSchedules.stream()
                .map(Schedule::getStudent)
                .filter(this::isStudent)
                .collect(Collectors.toMap(User::getId, Function.identity(), (first, second) -> first))
                .values()
                .stream()
                .sorted(Comparator.comparing(User::getFullName, String.CASE_INSENSITIVE_ORDER))
                .toList();

        List<Long> rosterScheduleIds = rosterSchedules.stream().map(Schedule::getId).toList();
        List<Long> studentIds = rosterStudents.stream().map(User::getId).toList();
        Map<Long, DutyRecord> presentRecords = dutyRepository.findByScheduleIdInOrderByTimeInAsc(rosterScheduleIds)
                .stream()
                .filter(record -> isStudent(record.getStudent()))
                .filter(record -> studentIds.contains(record.getStudent().getId()))
                .collect(Collectors.toMap(record -> record.getStudent().getId(), Function.identity(), (first, second) -> first));

        List<DutyAttendanceStudent> students = rosterStudents.stream()
                .map(student -> toStudentDto(student, presentRecords.get(student.getId()), schedule))
                .toList();

        int timedOutStudentCount = (int) presentRecords.values().stream()
                .filter(record -> record.getTimeOut() != null)
                .count();
        boolean submitted = !presentRecords.isEmpty() && presentRecords.values().stream()
                .allMatch(record -> record.getAttendanceSubmittedAt() != null);
        String sessionStartedAt = presentRecords.values().stream()
                .map(DutyRecord::getTimeIn)
                .min(Comparator.naturalOrder())
                .map(firstTimeIn -> {
                    LocalDateTime scheduledStart = schedule.getShiftDate().atTime(schedule.getStartTime());
                    return firstTimeIn.isBefore(scheduledStart) ? scheduledStart : firstTimeIn;
                })
                .map(LocalDateTime::toString)
                .orElse(null);

        List<DutyAttendanceStudent> presentStudents = rosterStudents.stream()
                .filter(student -> presentRecords.containsKey(student.getId()))
                .map(student -> toStudentDto(student, presentRecords.get(student.getId()), schedule))
                .toList();

        boolean checkedIn = currentStudentId != null && presentRecords.containsKey(currentStudentId);
        boolean checkedOut = checkedIn && presentRecords.get(currentStudentId).getTimeOut() != null;
        boolean timeOutOpen = !LocalTime.now(APP_ZONE).isBefore(schedule.getEndTime());

        boolean instructorBroadcasting = activeBroadcastingSignals.getOrDefault(scheduleSessionKey(schedule), false);

        String studentActualTimeIn = null;
        String studentActualTimeOut = null;
        Long studentDutyDurationMinutes = 0L;

        if (currentStudentId != null && presentRecords.containsKey(currentStudentId)) {
            DutyRecord studentRecord = presentRecords.get(currentStudentId);
            studentActualTimeIn = studentRecord.getTimeIn() != null ? studentRecord.getTimeIn().toString() : null;
            studentActualTimeOut = studentRecord.getTimeOut() != null ? studentRecord.getTimeOut().toString() : null;
            studentDutyDurationMinutes = calculateDutyDurationMinutes(studentRecord, schedule);
        }

        return new DutyAttendanceTodayResponse(
                true,
                getRepresentativeSchedule(schedule).getId(),
                schedule.getHospital(),
                schedule.getWard(),
                schedule.getShiftDate(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getInstructor().getId(),
                schedule.getInstructor().getFullName(),
                students.size(),
                presentStudents.size(),
                timedOutStudentCount,
                checkedIn,
                checkedOut,
                timeOutOpen,
                submitted,
                sessionStartedAt,
                scheduleOptions.stream().map(this::toScheduleOption).toList(),
                students,
                presentStudents,
                instructorBroadcasting,
                studentActualTimeIn,
                studentActualTimeOut,
                studentDutyDurationMinutes
        );
    }

    private DutyAttendanceStudent toStudentDto(User student, DutyRecord record, Schedule schedule) {
        return new DutyAttendanceStudent(
                student.getId(),
                student.getSchoolId(),
                student.getFullName(),
                student.getSectionInfo(),
                student.getProfileImageUrl(),
                record != null && record.getTimeIn() != null ? record.getTimeIn().toString() : null,
                record != null && record.getTimeOut() != null ? record.getTimeOut().toString() : null,
                calculateDutyDurationMinutes(record, schedule)
        );
    }

    private Long calculateDutyDurationMinutes(DutyRecord record, Schedule schedule) {
        if (record == null || record.getTimeIn() == null) {
            return 0L;
        }
        LocalDateTime effectiveStart = effectiveDutyStart(record, schedule);
        LocalDateTime endCalculation = record.getTimeOut() != null ? record.getTimeOut() : LocalDateTime.now(APP_ZONE);
        if (endCalculation.isBefore(effectiveStart)) {
            return 0L;
        }
        return Duration.between(effectiveStart, endCalculation).toMinutes();
    }

    private LocalDateTime effectiveDutyStart(DutyRecord record, Schedule schedule) {
        LocalDateTime scheduledStart = schedule.getShiftDate().atTime(schedule.getStartTime());
        if (record.getTimeIn() == null || record.getTimeIn().isBefore(scheduledStart)) {
            return scheduledStart;
        }
        return record.getTimeIn();
    }

    private DutyAttendanceStudent toStudentDto(User student, String timeIn) {
        return new DutyAttendanceStudent(
                student.getId(),
                student.getSchoolId(),
                student.getFullName(),
                student.getSectionInfo(),
                student.getProfileImageUrl(),
                timeIn,
                null,
                0L
        );
    }

    private List<Schedule> getRosterSchedules(Schedule schedule) {
        return scheduleRepository.findByInstructorIdAndHospitalIgnoreCaseAndWardIgnoreCaseAndShiftDateAndStartTimeAndEndTimeAndCanceledFalse(
                schedule.getInstructor().getId(),
                schedule.getHospital(),
                schedule.getWard(),
                schedule.getShiftDate(),
                schedule.getStartTime(),
                schedule.getEndTime()
        );
    }

    private Schedule getRepresentativeSchedule(Schedule schedule) {
        return getRosterSchedules(schedule).stream()
                .min(Comparator.comparing(Schedule::getId))
                .orElse(schedule);
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
