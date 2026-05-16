package edu.cit.nursetracker.clearance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentClearanceRepository extends JpaRepository<StudentClearance, Long> {
    Optional<StudentClearance> findFirstByStudentIdOrderByCreatedAtDesc(Long studentId);
}
