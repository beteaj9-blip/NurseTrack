package edu.cit.nursetracker.duty;

import java.time.LocalDate;
import java.time.LocalTime;

public record DutyAttendanceScheduleOption(
        Long scheduleId,
        String hospital,
        String ward,
        LocalDate shiftDate,
        LocalTime startTime,
        LocalTime endTime,
        Long instructorId,
        String instructorName,
        int scheduledStudentCount
) {
}
