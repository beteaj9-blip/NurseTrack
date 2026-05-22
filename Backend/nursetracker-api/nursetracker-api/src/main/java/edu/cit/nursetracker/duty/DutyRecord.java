package edu.cit.nursetracker.duty;

import com.fasterxml.jackson.annotation.JsonIgnore;
import edu.cit.nursetracker.schedule.Schedule;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id")
    @JsonIgnore
    private Schedule schedule;

    @Column(nullable = false)
    private String hospital;

    @Column(nullable = false)
    private String ward;

    @Column(nullable = false)
    private LocalDateTime timeIn;

    private LocalDateTime timeOut;

    private Double totalHours;

    public Double getTotalHours() {
        if (this.totalHours != null) {
            return this.totalHours;
        }
        if (this.timeIn != null && this.timeOut == null) {
            LocalDateTime start = this.timeIn;
            if (this.schedule != null) {
                try {
                    LocalDateTime scheduledStart = this.schedule.getShiftDate().atTime(this.schedule.getStartTime());
                    if (start.isBefore(scheduledStart)) {
                        start = scheduledStart;
                    }
                } catch (Exception e) {
                    // Ignore lazy init exception if session is closed
                }
            }
            LocalDateTime now = LocalDateTime.now(java.time.ZoneId.of("Asia/Manila"));
            if (now.isBefore(start)) {
                return 0.0;
            }
            return java.time.Duration.between(start, now).toMinutes() / 60.0;
        }
        return 0.0;
    }

    private LocalDateTime attendanceSubmittedAt;

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
