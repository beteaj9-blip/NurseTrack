package edu.cit.nursetracker.schedule;

public record ScheduleImportResult(
        int schedulesCreated,
        int duplicateSchedules,
        int studentsMatched,
        int studentsSkipped,
        int groupsPublished,
        int groupsSkipped,
        int level
) {}
