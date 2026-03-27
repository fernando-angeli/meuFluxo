package com.meufluxo.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "security.refresh-token")
public record RefreshTokenProperties(
        long expiration,
        String cookieName,
        String cookiePath,
        String sameSite,
        boolean secure,
        boolean httpOnly,
        String cookieDomain
) {
}
