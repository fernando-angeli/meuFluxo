package com.meufluxo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.DecodingException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;
    private final SecretKey secretKey;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.secretKey = buildSecretKey(jwtProperties.secret());
    }

    public String generateToken(CustomUserDetails userDetails) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusMillis(jwtProperties.expiration());

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim("uid", userDetails.getId())
                .claim("name", userDetails.getName())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(secretKey)
                .compact();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, CustomUserDetails userDetails) {
        Claims claims = extractAllClaims(token);
        boolean sameUser = userDetails.getUsername().equalsIgnoreCase(claims.getSubject());
        boolean notExpired = claims.getExpiration().after(new Date());
        return sameUser && notExpired;
    }

    public long getExpirationInSeconds() {
        return jwtProperties.expiration() / 1000;
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey buildSecretKey(String secret) {
        try {
            return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        } catch (DecodingException | IllegalArgumentException exception) {
            return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        }
    }
}
