package edu.cit.nursetracker.duty;

import edu.cit.nursetracker.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "duty_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DutyRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;

    @Column(nullable = false)
    private String hospital;

    @Column(nullable = false)
    private String ward;

    @Column(nullable = false)
    private LocalDateTime timeIn;

    private LocalDateTime timeOut;

    private Double totalHours;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DutyStatus status = DutyStatus.PENDING;

    private String instructorFeedback;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
