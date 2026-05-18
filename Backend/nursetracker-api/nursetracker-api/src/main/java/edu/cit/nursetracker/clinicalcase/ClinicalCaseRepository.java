package edu.cit.nursetracker.clinicalcase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClinicalCaseRepository extends JpaRepository<ClinicalCase, Long> {
    List<ClinicalCase> findAllByOrderByCaseDateDesc();
    List<ClinicalCase> findByStudentIdOrderByCaseDateDesc(Long studentId);
    List<ClinicalCase> findByInstructorIdOrderByCaseDateDesc(Long instructorId);
    List<ClinicalCase> findByStatus(CaseStatus status);
}
