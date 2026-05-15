package edu.cit.nursetracker.checklist;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "checklist_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String status; // "PENDING" or "COMPLETED"

    private Date dateCompleted;
}
