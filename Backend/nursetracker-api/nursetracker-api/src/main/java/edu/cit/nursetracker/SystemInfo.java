package edu.cit.nursetracker;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "system_info")
public class SystemInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String version;

    @Column(nullable = false)
    private LocalDate lastUpdated;

    private String schoolYear;

    private String semester;

    // Constructors
    public SystemInfo() {}

    public SystemInfo(String version, LocalDate lastUpdated) {
        this.version = version;
        this.lastUpdated = lastUpdated;
    }

    public SystemInfo(String version, LocalDate lastUpdated, String schoolYear, String semester) {
        this.version = version;
        this.lastUpdated = lastUpdated;
        this.schoolYear = schoolYear;
        this.semester = semester;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public LocalDate getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDate lastUpdated) { this.lastUpdated = lastUpdated; }
    public String getSchoolYear() { return schoolYear; }
    public void setSchoolYear(String schoolYear) { this.schoolYear = schoolYear; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
}
