package edu.cit.nursetracker.appeal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAppealRepository extends JpaRepository<StudentAppeal, Long> {
    List<StudentAppeal> findByStudentIdOrderByCreatedAtDesc(Long studentId);
}
