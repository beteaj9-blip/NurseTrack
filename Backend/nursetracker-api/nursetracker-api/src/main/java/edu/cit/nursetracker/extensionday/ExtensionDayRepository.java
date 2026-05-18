package edu.cit.nursetracker.extensionday;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExtensionDayRepository extends JpaRepository<ExtensionDay, Long> {
    List<ExtensionDay> findAllByOrderByCreatedAtDesc();
    List<ExtensionDay> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<ExtensionDay> findByInstructorIdOrderByCreatedAtDesc(Long instructorId);
    List<ExtensionDay> findByInstructorIdAndStudentIdOrderByCreatedAtDesc(Long instructorId, Long studentId);
}
