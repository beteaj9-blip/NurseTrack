package edu.cit.nursetracker.duty;

public record DutyAttendanceStudent(
        Long studentId,
        String schoolId,
        String fullName,
        String sectionInfo,
        String profileImageUrl,
        String timeIn,
        String timeOut
) {
}
