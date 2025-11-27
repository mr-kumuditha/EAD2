package com.eventhub.authservice.controller;

import com.eventhub.authservice.model.User;
import com.eventhub.authservice.payload.*;
import com.eventhub.authservice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);
            AuthResponse response = new AuthResponse(
                    true,
                    "Registration successful",
                    user.getUserId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            AuthResponse response = new AuthResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Optional<User> userOpt = authService.login(request);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                AuthResponse response = new AuthResponse(
                        true,
                        "Login successful",
                        user.getUserId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getRole()
                );
                return ResponseEntity.ok(response);
            }
            AuthResponse response = new AuthResponse(false, "Invalid credentials or role");
            return ResponseEntity.badRequest().body(response);
        } catch (RuntimeException e) {
            AuthResponse response = new AuthResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // GET /auth/users - Get all users (Admin only)
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can view all users");
        }
        List<User> users = authService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // GET /auth/users/count - Get total user count (Admin only)
    @GetMapping("/users/count")
    public ResponseEntity<?> getUserCount(@RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can view user count");
        }
        long count = authService.getUserCount();
        return ResponseEntity.ok(count);
    }

    // PUT /auth/users/{id} - Update user (Admin only)
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @RequestBody UpdateUserRequest request,
                                        @RequestHeader("X-User-Id") Long userId,
                                        @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can update users");
        }
        try {
            User updatedUser = authService.updateUser(id, request);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /auth/users/{id} - Delete user (Admin only)
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id,
                                        @RequestHeader("X-User-Id") Long userId,
                                        @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can delete users");
        }
        try {
            authService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth Service is running");
    }
}
