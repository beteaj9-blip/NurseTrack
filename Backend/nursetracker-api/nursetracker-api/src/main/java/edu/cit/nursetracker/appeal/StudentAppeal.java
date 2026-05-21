package edu.cit.nursetracker.appeal;

import edu.cit.nursetracker.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_appeals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAppeal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id")
    private User instructor;

    @Column(nullable = false)
    private String appealType;

    private LocalDate relatedDutyDate;

    @Column(nullable = false)
    private String clinicalSite;

    @Column(nullable = false)
    private String dutyArea;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String studentReason;

    @Column(length = 2000)
    private String evidenceNotes;

    private String supportingFiles;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AppealStatus status = AppealStatus.PENDING;

    private String instructorRemarks;

    @Enumerated(EnumType.STRING)
    private AppealStatus instructorDecision;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
