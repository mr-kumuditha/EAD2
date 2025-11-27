package com.eventhub.authservice.repository;


import com.eventhub.authservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// Repository for User CRUD
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username); // For login check

    Optional<User> findByEmail(String email); // For uniqueness check

}