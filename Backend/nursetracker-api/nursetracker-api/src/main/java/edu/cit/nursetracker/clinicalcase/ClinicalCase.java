package edu.cit.nursetracker.clinicalcase;

import edu.cit.nursetracker.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "clinical_cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClinicalCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CaseType caseType;

    @Column(nullable = false)
    private String patientInitials;

    private Integer patientAge;

    @Column(nullable = false)
    private LocalDate caseDate;

    // e.g., "Normal Spontaneous Delivery", "Appendectomy"
    @Column(nullable = false)
    private String diagnosis;

    @Column(nullable = false)
    private String procedureDetails;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CaseStatus status = CaseStatus.PENDING;

    private String instructorFeedback;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
