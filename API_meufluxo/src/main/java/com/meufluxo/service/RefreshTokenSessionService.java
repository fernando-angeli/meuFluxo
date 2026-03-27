package com.meufluxo.service;

import com.meufluxo.model.RefreshTokenSession;
import com.meufluxo.model.workspaceAndUsers.User;
import com.meufluxo.repository.RefreshTokenSessionRepository;
import com.meufluxo.security.RefreshTokenProperties;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class RefreshTokenSessionService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final RefreshTokenSessionRepository refreshTokenSessionRepository;
    private final RefreshTokenProperties refreshTokenProperties;

    public RefreshTokenSessionService(
            RefreshTokenSessionRepository refreshTokenSessionRepository,
            RefreshTokenProperties refreshTokenProperties
    ) {
        this.refreshTokenSessionRepository = refreshTokenSessionRepository;
        this.refreshTokenProperties = refreshTokenProperties;
    }

    @Transactional
    public IssuedRefreshToken issue(User user, String userAgent, String ipAddress) {
        String refreshToken = generateRefreshToken();
        RefreshTokenSession session = buildSession(user, refreshToken, userAgent, ipAddress);
        RefreshTokenSession saved = refreshTokenSessionRepository.save(session);
        return new IssuedRefreshToken(refreshToken, saved);
    }

    @Transactional
    public IssuedRefreshToken rotate(String refreshToken, String userAgent, String ipAddress) {
        RefreshTokenSession currentSession = validateActiveSession(refreshToken);
        currentSession.setLastUsedAt(LocalDateTime.now());
        currentSession.setRevokedAt(LocalDateTime.now());

        String nextRefreshToken = generateRefreshToken();
        RefreshTokenSession nextSession = buildSession(currentSession.getUser(), nextRefreshToken, userAgent, ipAddress);
        RefreshTokenSession savedNextSession = refreshTokenSessionRepository.save(nextSession);

        currentSession.setReplacedBySessionId(savedNextSession.getId());
        refreshTokenSessionRepository.save(currentSession);

        return new IssuedRefreshToken(nextRefreshToken, savedNextSession);
    }

    @Transactional
    public void revoke(String refreshToken) {
        if (!StringUtils.hasText(refreshToken)) {
            return;
        }

        refreshTokenSessionRepository.findByTokenHash(hashToken(refreshToken))
                .ifPresent(session -> {
                    if (session.getRevokedAt() == null) {
                        session.setRevokedAt(LocalDateTime.now());
                        refreshTokenSessionRepository.save(session);
                    }
                });
    }

    @Transactional(readOnly = true)
    public RefreshTokenSession validateActiveSession(String refreshToken) {
        if (!StringUtils.hasText(refreshToken)) {
            throw new BadCredentialsException("Refresh token inválido.");
        }

        RefreshTokenSession session = refreshTokenSessionRepository.findByTokenHash(hashToken(refreshToken))
                .orElseThrow(() -> new BadCredentialsException("Refresh token inválido."));

        LocalDateTime now = LocalDateTime.now();
        boolean expired = session.getExpiresAt().isBefore(now);
        boolean revoked = session.getRevokedAt() != null;
        if (expired || revoked) {
            throw new BadCredentialsException("Refresh token inválido.");
        }

        return session;
    }

    private RefreshTokenSession buildSession(User user, String refreshToken, String userAgent, String ipAddress) {
        RefreshTokenSession session = new RefreshTokenSession();
        session.setUser(user);
        session.setTokenHash(hashToken(refreshToken));
        session.setExpiresAt(LocalDateTime.now().plusSeconds(refreshTokenProperties.expiration() / 1000));
        session.setUserAgent(trimToNull(userAgent));
        session.setIpAddress(trimToNull(ipAddress));
        return session;
    }

    private String generateRefreshToken() {
        byte[] randomBytes = new byte[48];
        SECURE_RANDOM.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private static String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 não disponível no ambiente.", exception);
        }
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    public record IssuedRefreshToken(String rawToken, RefreshTokenSession session) {
    }
}
