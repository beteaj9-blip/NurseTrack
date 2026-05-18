package edu.cit.nursetracker.hospital;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Entity
@Table(name = "hospitals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hospital {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String fullName;

    private String label;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private Boolean active = true;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "hospital_wards", joinColumns = @JoinColumn(name = "hospital_id"))
    @Column(name = "ward_name")
    private List<String> wards;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "hospital_inactive_wards", joinColumns = @JoinColumn(name = "hospital_id"))
    @Column(name = "ward_name")
    private List<String> inactiveWards;
}
