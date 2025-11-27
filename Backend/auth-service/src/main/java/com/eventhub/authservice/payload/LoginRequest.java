package com.eventhub.authservice.payload;

import com.eventhub.authservice.model.Role;
import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
    private Role role; // New: Dropdown selection (ADMIN/USER), validated against stored role
}
