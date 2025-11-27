package com.eventhub.authservice.config; // Make sure this package is correct

import com.eventhub.authservice.model.Role;
import com.eventhub.authservice.model.User;
import com.eventhub.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component // 1. Make sure @Component annotation is present
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {

        // 2. ADD THIS LINE:
        System.out.println(">>> DataInitializer class IS RUNNING <<<");

        // Check both username and email
        if (userRepository.findByUsername("admin").isEmpty() &&
                userRepository.findByEmail("admin@eventhub.com").isEmpty()) {

            User adminUser = new User();
            // ... (rest of the user setup)
            adminUser.setFirstName("Admin");
            adminUser.setLastName("User");
            adminUser.setUsername("admin");
            adminUser.setEmail("admin@eventhub.com");
            adminUser.setPassword("admin123");
            adminUser.setRole(Role.ADMIN);

            userRepository.save(adminUser);
            System.out.println(">>> Admin user created successfully");
        }
    }
}