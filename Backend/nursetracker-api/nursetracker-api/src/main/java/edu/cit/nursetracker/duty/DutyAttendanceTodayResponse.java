package edu.cit.nursetracker.duty;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record DutyAttendanceTodayResponse(
        boolean hasSchedule,
        Long scheduleId,
        String hospital,
        String ward,
        LocalDate shiftDate,
        LocalTime startTime,
        LocalTime endTime,
        Long instructorId,
        String instructorName,
        int scheduledStudentCount,
        int presentStudentCount,
        int timedOutStudentCount,
        boolean checkedIn,
        boolean checkedOut,
        boolean timeOutOpen,
        boolean submitted,
        String sessionStartedAt,
        List<DutyAttendanceScheduleOption> scheduleOptions,
        List<DutyAttendanceStudent> students,
        List<DutyAttendanceStudent> presentStudents
) {
    public static DutyAttendanceTodayResponse empty() {
        return new DutyAttendanceTodayResponse(false, null, null, null, null, null, null, null, null, 0, 0, 0, false, false, false, false, null, List.of(), List.of(), List.of());
    }
}
