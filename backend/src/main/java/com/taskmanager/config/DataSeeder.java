package com.taskmanager.config;

import com.taskmanager.entity.User;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@taskmanager.com")) {
            User admin = User.builder()
                    .name("Admin User")
                    .email("admin@taskmanager.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println(">>> Seeded admin user: admin@taskmanager.com / admin123");
        }
        if (!userRepository.existsByEmail("member@taskmanager.com")) {
            User member = User.builder()
                    .name("Demo Member")
                    .email("member@taskmanager.com")
                    .password(passwordEncoder.encode("member123"))
                    .role(User.Role.MEMBER)
                    .build();
            userRepository.save(member);
            System.out.println(">>> Seeded member user: member@taskmanager.com / member123");
        }
    }
}
