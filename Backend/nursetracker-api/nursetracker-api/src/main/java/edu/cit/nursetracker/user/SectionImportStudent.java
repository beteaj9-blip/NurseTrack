package edu.cit.nursetracker.user;

public record SectionImportStudent(
        String studentNo,
        String name,
        String schoolId,
        String courseYear,
        Integer level,
        boolean matched,
        Long userId,
        String databaseName,
        String currentSection,
        String profileImageUrl
) {}
