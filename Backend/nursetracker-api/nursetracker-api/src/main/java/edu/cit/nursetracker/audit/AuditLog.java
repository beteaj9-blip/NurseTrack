package edu.cit.nursetracker.audit;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String actor;

    @Column(nullable = false)
    private String actorRole;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String recordName;

    private String context;

    @Column(nullable = false)
    private String category;

    @CreationTimestamp
    private LocalDateTime occurredAt;
}
