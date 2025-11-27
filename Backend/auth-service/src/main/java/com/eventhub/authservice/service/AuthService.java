package com.eventhub.authservice.service;

import com.eventhub.authservice.model.Role;
import com.eventhub.authservice.model.User;
import com.eventhub.authservice.payload.LoginRequest;
import com.eventhub.authservice.payload.RegisterRequest;
import com.eventhub.authservice.payload.UpdateUserRequest;
import com.eventhub.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    // Simple email regex pattern
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$"
    );

    // Register new user with validation
    public User register(RegisterRequest request) {
        // Check required fields individually with friendly messages
        if (isEmpty(request.getFirstName())) {
            throw new RuntimeException("Please enter your first name");
        }
        if (isEmpty(request.getLastName())) {
            throw new RuntimeException("Please enter your last name");
        }
        if (isEmpty(request.getUsername())) {
            throw new RuntimeException("Please choose a username");
        }
        if (isEmpty(request.getEmail())) {
            throw new RuntimeException("Please enter your email address");
        }
        if (!EMAIL_PATTERN.matcher(request.getEmail()).matches()) {
            throw new RuntimeException("Please enter a valid email address");
        }
        if (isEmpty(request.getPassword())) {
            throw new RuntimeException("Please enter a password");
        }
        if (isEmpty(request.getConfirmPassword())) {
            throw new RuntimeException("Please confirm your password");
        }

        // Check passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // Check if username or email already exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("This username is already taken");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("This email is already registered");
        }

        // Create user
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // Plain text for now
        user.setRole(Role.USER); // Default role

        return userRepository.save(user);
    }

    // Login: Check credentials and role match
    public Optional<User> login(LoginRequest request) {
        if (isEmpty(request.getUsername())) {
            throw new RuntimeException("Please enter your username");
        }
        if (isEmpty(request.getPassword())) {
            throw new RuntimeException("Please enter your password");
        }
        if (request.getRole() == null) {
            throw new RuntimeException("Please select a role");
        }

        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isPresent() &&
                userOpt.get().getPassword().equals(request.getPassword()) &&
                userOpt.get().getRole().equals(request.getRole())) {
            return userOpt;
        }

        throw new RuntimeException("Invalid credentials or role");
    }

    // Get all users (Admin only)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get user count (Admin only)
    public long getUserCount() {
        return userRepository.count();
    }

    // Update user (Admin only)
    public User updateUser(Long id, UpdateUserRequest request) {
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();

        // Validate email format if provided
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (!EMAIL_PATTERN.matcher(request.getEmail()).matches()) {
                throw new RuntimeException("Please enter a valid email address");
            }
            // Check if email is already taken by another user
            Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
            if (existingUser.isPresent() && !existingUser.get().getUserId().equals(id)) {
                throw new RuntimeException("This email is already registered");
            }
            user.setEmail(request.getEmail());
        }

        // Check if username is already taken by another user
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            Optional<User> existingUser = userRepository.findByUsername(request.getUsername());
            if (existingUser.isPresent() && !existingUser.get().getUserId().equals(id)) {
                throw new RuntimeException("This username is already taken");
            }
            user.setUsername(request.getUsername());
        }

        // Update other fields if provided
        if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
            user.setLastName(request.getLastName());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        return userRepository.save(user);
    }

    // Delete user (Admin only)
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    // Helper method
    private boolean isEmpty(String s) {
        return s == null || s.trim().isEmpty();
    }
}
