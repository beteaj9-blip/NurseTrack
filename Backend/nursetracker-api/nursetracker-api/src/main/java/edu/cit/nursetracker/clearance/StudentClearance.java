package edu.cit.nursetracker.clearance;

import edu.cit.nursetracker.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_clearances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentClearance {

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
    private String schoolYear;

    @Column(nullable = false)
    private String semester;

    private String remarks;

    @Column(name = "attachment_url")
    private String attachmentUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ClearanceStatus status = ClearanceStatus.LOCKED;

    @Column(name = "is_cleared", nullable = false)
    @Builder.Default
    private Boolean isCleared = false;

    @Column(name = "term_info")
    private String termInfo;

    private LocalDateTime submittedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
