package com.meufluxo.dto.auth;

public record RefreshResponse(
        String accessToken,
        String tokenType,
        long expiresIn
) {
}
