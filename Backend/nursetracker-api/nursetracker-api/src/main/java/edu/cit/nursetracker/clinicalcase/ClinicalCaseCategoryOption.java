package edu.cit.nursetracker.clinicalcase;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "clinical_case_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClinicalCaseCategoryOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String value;

    @Column(name = "category_name", nullable = false)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(name = "case_type")
    private CaseType caseType;

    @Column(name = "required_count")
    private Integer requiredCount;
}
