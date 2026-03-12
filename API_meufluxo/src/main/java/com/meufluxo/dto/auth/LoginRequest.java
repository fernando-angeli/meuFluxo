package com.meufluxo.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "Email is required.")
        @Email(message = "Email must be valid.")
        String email,

        @NotBlank(message = "Password is required.")
        @Size(min = 6, max = 255, message = "Password must have between 6 and 255 characters.")
        String password
) {
}
