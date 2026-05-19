package edu.cit.nursetracker.academicterm;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicTermRepository extends JpaRepository<AcademicTerm, Long> {
    Optional<AcademicTerm> findFirstByActiveTrueOrderByUpdatedAtDesc();
    Optional<AcademicTerm> findFirstBySchoolYearIgnoreCaseAndSemesterIgnoreCase(String schoolYear, String semester);
    List<AcademicTerm> findAllByOrderByUpdatedAtDesc();
}
