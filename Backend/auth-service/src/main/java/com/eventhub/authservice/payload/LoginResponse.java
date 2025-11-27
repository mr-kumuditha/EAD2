package com.eventhub.authservice.payload;

import com.eventhub.authservice.model.Role;
import lombok.Data;

@Data
public class LoginResponse {
    private Long userId;
    private String username;
    private String email;
    private Role role;
    private String message;

    public LoginResponse(Long userId, String username, String email, Role role, String message) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.message = message;
    }
}