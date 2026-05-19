package edu.cit.nursetracker.user;

import java.util.List;

public record SectionImportPreview(
        String filename,
        String schoolYear,
        String semester,
        String section,
        Integer level,
        int totalStudents,
        int matchedStudents,
        int skippedStudents,
        List<SectionImportStudent> students
) {}
