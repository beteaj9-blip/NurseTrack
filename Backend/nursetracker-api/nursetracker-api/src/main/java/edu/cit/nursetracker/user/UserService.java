package edu.cit.nursetracker.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User createUser(User user) {
        if (user.getStatus() == null) {
            user.setStatus(UserStatus.PENDING);
        }
        // Here you would normally hash the password before saving
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    public User updateUserStatus(Long id, UserStatus newStatus) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setStatus(newStatus);
        return userRepository.save(user);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public boolean changePassword(Long id, String currentPassword, String newPassword) {
        User user = getUserById(id).orElse(null);
        if (user != null && user.getPasswordHash().equals(currentPassword)) {
            user.setPasswordHash(newPassword);
            userRepository.save(user);
            return true;
        }
        return false;
    }
}
