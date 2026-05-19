package edu.cit.nursetracker.clearance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClearanceSettingsRepository extends JpaRepository<ClearanceSettings, Long> {
    Optional<ClearanceSettings> findFirstByOrderByIdAsc();
}
