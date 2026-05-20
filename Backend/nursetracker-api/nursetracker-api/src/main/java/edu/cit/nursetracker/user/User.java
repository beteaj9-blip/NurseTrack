package edu.cit.nursetracker.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String schoolId;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    private String mobileNumber;

    @Column(nullable = false)
    @JsonIgnore
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    // E.g., BSN 3A, Ward B, Nursing Office
    private String sectionInfo;

    private String groupInfo;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_assigned_levels", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "assigned_level", nullable = false)
    @Builder.Default
    private Set<Integer> assignedLevels = new HashSet<>();

    @Column(name = "level")
    private String level;

    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.PENDING;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Transient
    public int getProfileCompletionPercentage() {
        int total = 6;
        int completed = 0;
        if (fullName != null && !fullName.isBlank()) completed++;
        if (email != null && !email.isBlank()) completed++;
        if (mobileNumber != null && !mobileNumber.isBlank()) completed++;
        if (schoolId != null && !schoolId.isBlank()) completed++;
        if (sectionInfo != null && !sectionInfo.isBlank()) completed++;
        if (profileImageUrl != null && !profileImageUrl.isBlank()) completed++;
        return Math.round((completed * 100f) / total);
    }

    @PrePersist
    @PreUpdate
    public void syncLevelColumn() {
        if (assignedLevels == null || assignedLevels.isEmpty()) {
            level = null;
            return;
        }
        level = assignedLevels.stream()
                .sorted()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
    }
}
