package com.eventhub.authservice.model;

import jakarta.persistence.*;
import lombok.Data;

// User entity for DB storage
@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String firstName;
    private String lastName;

    @Column(unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role; // ENUM for USER/ADMIN
}
