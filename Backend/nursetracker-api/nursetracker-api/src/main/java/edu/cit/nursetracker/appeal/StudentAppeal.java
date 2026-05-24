package edu.cit.nursetracker.appeal;

import edu.cit.nursetracker.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

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

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "title", nullable = false)
    @JsonAlias({"title"})
    private String title;

    @Column(name = "details", nullable = false, length = 2000)
    private String details;

    @Column(name = "student_reason", nullable = false, length = 2000)
    @JsonAlias({"studentReason", "student_reason"})
    private String studentReason;

    @Column(length = 2000)
    private String evidenceNotes;

    @Column(name = "attachment_url")
    @JsonAlias({"supporting_files", "attachmentUrl"})
    private String supportingFiles;

    @Column(name = "supporting_file_name")
    @JsonAlias({"supporting_file_name", "attachmentName", "attachment_name"})
    private String supportingFileName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AppealStatus status = AppealStatus.PENDING;

    @Column(name = "instructor_recommendation")
    private String instructorRemarks;

    @Enumerated(EnumType.STRING)
    private AppealStatus instructorDecision;

    @Column(name = "chair_decision")
    private String chairDecision;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @JsonProperty("supporting_files")
    public String getSupportingFilesSnakeCase() {
        return supportingFiles;
    }

    @JsonProperty("supporting_file_name")
    public String getSupportingFileNameSnakeCase() {
        return supportingFileName;
    }

    @JsonProperty("instructorRecommendation")
    public String getInstructorRecommendation() {
        return instructorRemarks;
    }

    @JsonProperty("instructor_recommendation")
    public String getInstructorRecommendationSnakeCase() {
        return instructorRemarks;
    }

    @JsonProperty("studentReason")
    public String getStudentReasonCamelCase() {
        return studentReason;
    }

    @JsonProperty("student_reason")
    public String getStudentReasonSnakeCase() {
        return studentReason;
    }

    @JsonProperty("title")
    public String getTitleAlias() {
        return title;
    }

    @JsonProperty("sddStatus")
    public String getSddStatus() {
        if (status == AppealStatus.RETURNED) return "REJECTED";
        return status == null ? null : status.name();
    }

    @JsonProperty("sddInstructorDecision")
    public String getSddInstructorDecision() {
        if (instructorDecision == AppealStatus.RETURNED) return "REJECTED";
        return instructorDecision == null ? null : instructorDecision.name();
    }
}
