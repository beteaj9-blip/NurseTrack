package edu.cit.nursetracker.clinicalcase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClinicalCaseCategoryOptionRepository extends JpaRepository<ClinicalCaseCategoryOption, Long> {
    List<ClinicalCaseCategoryOption> findAllByOrderByIdAsc();
}
