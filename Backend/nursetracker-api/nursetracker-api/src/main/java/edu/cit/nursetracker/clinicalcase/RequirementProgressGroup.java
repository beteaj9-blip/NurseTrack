package edu.cit.nursetracker.clinicalcase;

import java.util.List;

public record RequirementProgressGroup(
        String code,
        String label,
        List<RequirementProgressItem> items
) {
}
