package edu.cit.nursetracker.user;

import java.util.List;

public record SectionImportResult(
        String filename,
        String schoolYear,
        String semester,
        String section,
        Integer level,
        int totalStudents,
        int matchedStudents,
        int skippedStudents,
        int updatedStudents,
        List<SectionImportStudent> students
) {}
