package edu.cit.nursetracker.adminaccess;

import edu.cit.nursetracker.user.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "admin_access_permissions", uniqueConstraints = @UniqueConstraint(columnNames = {"role", "permission_key"}))
@Getter
@Setter
public class AdminAccessPermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(name = "permission_key", nullable = false)
    private String permissionKey;

    @Column(nullable = false)
    private boolean enabled;
}
