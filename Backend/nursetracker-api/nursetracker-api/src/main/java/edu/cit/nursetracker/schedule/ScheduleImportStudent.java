package edu.cit.nursetracker.schedule;

import java.util.Set;

public record ScheduleImportStudent(
        String name,
        boolean matched,
        String schoolId,
        String section,
        Set<Integer> levels,
        String profileImageUrl
) {}
