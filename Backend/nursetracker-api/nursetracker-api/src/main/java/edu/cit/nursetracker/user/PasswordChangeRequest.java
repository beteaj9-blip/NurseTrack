package edu.cit.nursetracker.user;

import lombok.Data;

@Data
public class PasswordChangeRequest {
    private String currentPassword;
    private String newPassword;
}
