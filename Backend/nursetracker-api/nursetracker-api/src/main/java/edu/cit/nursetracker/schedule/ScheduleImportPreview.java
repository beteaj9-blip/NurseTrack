package edu.cit.nursetracker.schedule;

import java.util.List;

public record ScheduleImportPreview(
        String fileName,
        int level,
        List<ScheduleImportGroup> groups,
        int totalStudents,
        int matchedStudents,
        int skippedStudents
) {}
