package edu.cit.nursetracker.schedule;

import java.util.List;

public record ScheduleImportGroup(
        String id,
        String section,
        String startDate,
        String endDate,
        List<String> breakDates,
        String shiftStart,
        String shiftEnd,
        String hospitalArea,
        String dutyType,
        String casePresentationDate,
        String casePresentationTime,
        boolean noCasePresentation,
        String instructor,
        List<String> students,
        List<ScheduleImportStudent> studentRecords,
        int matchedStudents,
        int skippedStudents,
        boolean instructorMatched,
        boolean locationMatched
) {}
