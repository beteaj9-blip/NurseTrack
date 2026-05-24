package edu.cit.nursetracker.user;

import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor

public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(@RequestBody java.util.Map<String, String> credentials) {
        String identifier = credentials.get("userId");
        String password = credentials.get("password");
        
        User user = userService.getAllUsers().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(identifier) || u.getSchoolId().equalsIgnoreCase(identifier))
                .findFirst()
                .orElse(null);
                
        if (user == null || !user.getPasswordHash().equals(password)) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(new LoginResponse(user, jwtService.createToken(user)));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(HttpServletRequest request) {
        Long userId = jwtService.getUserId(request);
        return userService.getUserById(userId).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Long viewerId,
            HttpServletRequest request) {
        Long effectiveViewerId = viewerId != null ? viewerId : jwtService.getUserId(request);
        User viewer = userService.getUserById(effectiveViewerId).orElse(null);
        if (viewer != null && viewer.getRole() == UserRole.ADMIN && viewerId == null) {
            if (role != null) return ResponseEntity.ok(userService.getUsersByRole(role));
            return ResponseEntity.ok(userService.getAllUsers());
        }

        if (role != null) return ResponseEntity.ok(userService.getUsersByRoleVisibleTo(role, effectiveViewerId));
        return ResponseEntity.ok(userService.getUsersVisibleTo(effectiveViewerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody java.util.Map<String, String> payload) {
        String email = clean(payload.get("email"));
        String schoolId = clean(payload.get("schoolId"));
        if (userService.emailExists(email)) {
            return ResponseEntity.status(409).body(java.util.Map.of("message", "An account with this school email already exists."));
        }
        if (userService.schoolIdExists(schoolId)) {
            return ResponseEntity.status(409).body(java.util.Map.of("message", "An account with this School ID already exists."));
        }
        User user = new User();
        UserRole role = payload.containsKey("role") ? UserRole.valueOf(payload.get("role")) : UserRole.STUDENT;
        user.setFullName(clean(payload.get("fullName")));
        user.setEmail(email);
        user.setMobileNumber(payload.get("mobileNumber"));
        user.setSchoolId(schoolId);
        user.setSectionInfo(clean(payload.get("sectionInfo")));
        user.setGroupInfo(clean(payload.get("groupInfo")));
        user.setAssignedLevels(assignedLevelsForRole(role, payload.getOrDefault("assignedLevels", "1")));
        user.setPasswordHash(payload.getOrDefault("password", payload.getOrDefault("schoolId", "password")));
        user.setRole(role);
        user.setStatus(payload.containsKey("status") ? UserStatus.valueOf(payload.get("status")) : UserStatus.ACTIVE);
        return ResponseEntity.ok(userService.saveUser(user));
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
            if (updates.containsKey("mobileNumber")) user.setMobileNumber(updates.get("mobileNumber"));
            if (updates.containsKey("schoolId")) user.setSchoolId(updates.get("schoolId"));
            if (updates.containsKey("sectionInfo")) user.setSectionInfo(updates.get("sectionInfo"));
            if (updates.containsKey("groupInfo")) user.setGroupInfo(updates.get("groupInfo"));
            if (updates.containsKey("assignedLevels")) user.setAssignedLevels(parseAssignedLevels(updates.get("assignedLevels")));
            if (updates.containsKey("role")) user.setRole(UserRole.valueOf(updates.get("role")));
            if (user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.COORDINATOR || user.getRole() == UserRole.ENROLLMENT) user.setAssignedLevels(new HashSet<>(Set.of(1, 2, 3, 4)));
            if (user.getRole() == UserRole.INSTRUCTOR) user.setAssignedLevels(firstAssignedLevel(user.getAssignedLevels()));
            if (updates.containsKey("status")) user.setStatus(UserStatus.valueOf(updates.get("status")));
            if (updates.containsKey("profileImageUrl")) user.setProfileImageUrl(updates.get("profileImageUrl"));
            return ResponseEntity.ok(userService.saveUser(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody java.util.Map<String, String> payload) {
        String email = clean(payload.get("email"));
        String schoolId = clean(payload.get("schoolId"));
        if (userService.emailExists(email)) {
            return ResponseEntity.status(409).body(java.util.Map.of("message", "An account with this school email already exists."));
        }
        if (userService.schoolIdExists(schoolId)) {
            return ResponseEntity.status(409).body(java.util.Map.of("message", "An account with this School ID already exists."));
        }
        User user = new User();
        user.setFullName(clean(payload.get("fullName")));
        user.setEmail(email);
        user.setMobileNumber(payload.get("mobileNumber"));
        user.setSchoolId(schoolId);
        user.setSectionInfo(clean(payload.get("sectionInfo")));
        user.setAssignedLevels(new HashSet<>(Set.of(1)));
        user.setPasswordHash(payload.get("password")); // Direct map password to passwordHash
        
        user.setRole(UserRole.STUDENT);

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

    @PutMapping("/{id}/password/reset")
    public ResponseEntity<?> resetPassword(@PathVariable Long id) {
        return userService.getUserById(id).map(user -> {
            String generated = userService.resetPasswordToInitials(user);
            return ResponseEntity.ok(java.util.Map.of("password", generated));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> payload) {
        String accountId = payload.getOrDefault("accountId", "").trim();
        if (accountId.isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "accountId is required"));
        }
        return userService.findByEmailOrSchoolId(accountId)
                .map(user -> {
                    String generated = userService.resetPasswordToInitials(user);
                    return ResponseEntity.ok(java.util.Map.of("password", generated));
                })
                .orElse(ResponseEntity.status(404).body(java.util.Map.of("message", "No account found for that school email or ID.")));
    }

    @PostMapping("/section-import")
    public ResponseEntity<java.util.Map<String, Integer>> importSectionAssignments(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(userService.importSectionAssignments(file));
    }

    @PostMapping("/section-import/preview")
    public ResponseEntity<SectionImportPreview> previewSectionAssignments(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(userService.previewSectionAssignments(file));
    }

    @PostMapping("/section-import/publish")
    public ResponseEntity<SectionImportResult> publishSectionAssignments(@RequestBody SectionImportPreview preview) {
        return ResponseEntity.ok(userService.publishSectionAssignments(preview));
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateCurrentUser(HttpServletRequest request, @RequestBody java.util.Map<String, String> updates) {
        return updateUser(jwtService.getUserId(request), updates);
    }

    private Set<Integer> parseAssignedLevels(String value) {
        if (value == null || value.isBlank()) return new HashSet<>();
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(part -> !part.isBlank())
                .map(Integer::parseInt)
                .collect(Collectors.toSet());
    }

    private Set<Integer> assignedLevelsForRole(UserRole role, String value) {
        if (role == UserRole.ADMIN || role == UserRole.COORDINATOR || role == UserRole.ENROLLMENT) return new HashSet<>(Set.of(1, 2, 3, 4));
        if (role == UserRole.INSTRUCTOR) return firstAssignedLevel(parseAssignedLevels(value));
        return parseAssignedLevels(value);
    }

    private Set<Integer> firstAssignedLevel(Set<Integer> levels) {
        return levels.stream().sorted().findFirst().map(level -> new HashSet<>(Set.of(level))).orElseGet(HashSet::new);
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }
}
