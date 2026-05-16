package edu.cit.nursetracker.appeal;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "appeal_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppealTypeOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String value;

    @Column(nullable = false)
    private String label;
}
