package com.eventhub.authservice.payload;

import com.eventhub.authservice.model.Role;
import lombok.Data;

@Data
public class AuthResponse {
    private boolean success;
    private String message;
    private Long userId;
    private String username;
    private String email;
    private Role role;

    // Success constructor
    public AuthResponse(boolean success, String message, Long userId, String username, String email, Role role) {
        this.success = success;
        this.message = message;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    // Error constructor
    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}