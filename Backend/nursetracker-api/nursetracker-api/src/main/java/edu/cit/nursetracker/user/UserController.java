package edu.cit.nursetracker.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor

public class UserController {

    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<User> loginUser(@RequestBody java.util.Map<String, String> credentials) {
        String identifier = credentials.get("userId");
        String password = credentials.get("password");
        
        User user = userService.getAllUsers().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(identifier) || u.getSchoolId().equalsIgnoreCase(identifier))
                .findFirst()
                .orElse(null);
                
        if (user == null || !user.getPasswordHash().equals(password)) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(
            @RequestParam(required = false) UserRole role) {
        
        if (role != null) {
            return ResponseEntity.ok(userService.getUsersByRole(role));
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<User> updateUserStatus(@PathVariable Long id, @RequestParam UserStatus status) {
        return ResponseEntity.ok(userService.updateUserStatus(id, status));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody java.util.Map<String, String> updates) {
        return userService.getUserById(id).map(user -> {
            if (updates.containsKey("fullName")) user.setFullName(updates.get("fullName"));
            if (updates.containsKey("email")) user.setEmail(updates.get("email"));
            if (updates.containsKey("schoolId")) user.setSchoolId(updates.get("schoolId"));
            if (updates.containsKey("sectionInfo")) user.setSectionInfo(updates.get("sectionInfo"));
            return ResponseEntity.ok(userService.saveUser(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody java.util.Map<String, String> payload) {
        User user = new User();
        user.setFullName(payload.get("fullName"));
        user.setEmail(payload.get("email"));
        user.setSchoolId(payload.get("schoolId"));
        user.setSectionInfo(payload.get("sectionInfo"));
        user.setPasswordHash(payload.get("password")); // Direct map password to passwordHash
        
        try {
            user.setRole(UserRole.valueOf(payload.get("role")));
        } catch (Exception e) {
            user.setRole(UserRole.STUDENT);
        }

        user.setStatus(UserStatus.ACTIVE);
        return ResponseEntity.ok(userService.saveUser(user));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody PasswordChangeRequest request) {
        boolean success = userService.changePassword(id, request.getCurrentPassword(), request.getNewPassword());
        if (success) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().body("Invalid current password");
        }
    }
}
