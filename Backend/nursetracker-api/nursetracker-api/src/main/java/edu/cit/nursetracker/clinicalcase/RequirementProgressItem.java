package edu.cit.nursetracker.clinicalcase;

public record RequirementProgressItem(
        String label,
        long completed,
        long total
) {
}
