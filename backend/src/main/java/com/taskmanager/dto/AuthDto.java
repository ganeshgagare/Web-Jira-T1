package com.taskmanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDto {

    @Data
    public static class SignupRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank @Email(message = "Valid email required")
        private String email;

        @NotBlank @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        private String role; // ADMIN or MEMBER (defaults to MEMBER)
    }

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String email;
        private String name;
        private String role;
        private Long id;

        public AuthResponse(String token, String email, String name, String role, Long id) {
            this.token = token;
            this.email = email;
            this.name = name;
            this.role = role;
            this.id = id;
        }
    }
}
