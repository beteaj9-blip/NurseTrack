package edu.cit.nursetracker.user;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

public final class AccessScope {
    private AccessScope() {}

    public static boolean canViewAll(User viewer) {
        return viewer != null && (viewer.getRole() == UserRole.ADMIN || viewer.getRole() == UserRole.COORDINATOR || viewer.getRole() == UserRole.ENROLLMENT);
    }

    public static boolean canViewUser(User viewer, User target) {
        if (viewer == null || target == null) return false;
        if (canViewAll(viewer)) return true;
        if (viewer.getRole() == UserRole.CHAIR || viewer.getRole() == UserRole.ASSISTANT) {
            if (target.getRole() == UserRole.INSTRUCTOR) return true;
            return intersects(target.getAssignedLevels(), viewer.getAssignedLevels());
        }
        if (viewer.getRole() == UserRole.INSTRUCTOR || viewer.getRole() == UserRole.STUDENT) {
            return sameSection(viewer.getSectionInfo(), target.getSectionInfo());
        }
        return false;
    }

    public static boolean canViewRecord(User viewer, User student, User instructor) {
        if (viewer == null) return false;
        if (canViewAll(viewer)) return true;
        if (viewer.getRole() == UserRole.CHAIR || viewer.getRole() == UserRole.ASSISTANT) {
            if (student != null) return intersects(student.getAssignedLevels(), viewer.getAssignedLevels());
            return intersects(instructor == null ? null : instructor.getAssignedLevels(), viewer.getAssignedLevels());
        }
        if (viewer.getRole() == UserRole.INSTRUCTOR || viewer.getRole() == UserRole.STUDENT) {
            boolean directlyAssigned = instructor != null && instructor.getId() != null && instructor.getId().equals(viewer.getId());
            boolean levelMatch = student != null && intersects(student.getAssignedLevels(), viewer.getAssignedLevels());
            return directlyAssigned
                    || levelMatch
                    || sameSection(viewer.getSectionInfo(), student == null ? null : student.getSectionInfo())
                    || sameSection(viewer.getSectionInfo(), instructor == null ? null : instructor.getSectionInfo());
        }
        return false;
    }

    public static boolean intersects(Set<Integer> recordLevels, Set<Integer> visibleLevels) {
        if (recordLevels == null || visibleLevels == null || recordLevels.isEmpty() || visibleLevels.isEmpty()) return false;
        Set<Integer> overlap = new HashSet<>(recordLevels);
        overlap.retainAll(visibleLevels);
        return !overlap.isEmpty();
    }

    private static boolean sameSection(String first, String second) {
        Set<String> firstSections = splitSections(first);
        Set<String> secondSections = splitSections(second);
        if (firstSections.isEmpty() || secondSections.isEmpty()) return false;
        firstSections.retainAll(secondSections);
        return !firstSections.isEmpty();
    }

    private static Set<String> splitSections(String value) {
        if (value == null || value.isBlank()) return Set.of();
        return Arrays.stream(value.split("[,;|/\\n]+"))
                .map(section -> section.trim().toLowerCase(Locale.ROOT))
                .filter(section -> !section.isBlank())
                .collect(Collectors.toSet());
    }
}
