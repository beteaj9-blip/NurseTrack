package edu.cit.nursetracker.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findBySchoolId(String schoolId);
    List<User> findByRole(UserRole role);
    List<User> findByStatus(UserStatus status);
}
