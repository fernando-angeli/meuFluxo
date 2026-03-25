package com.meufluxo.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class RefreshTokenCookieService {

    private final RefreshTokenProperties properties;

    public RefreshTokenCookieService(RefreshTokenProperties properties) {
        this.properties = properties;
    }

    public String buildRefreshTokenCookie(String refreshToken) {
        String path = StringUtils.hasText(properties.cookiePath()) ? properties.cookiePath() : "/";
        String sameSite = StringUtils.hasText(properties.sameSite()) ? properties.sameSite() : "Lax";

        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from(properties.cookieName(), refreshToken)
                .httpOnly(properties.httpOnly())
                .secure(properties.secure())
                .path(path)
                .sameSite(sameSite)
                .maxAge(properties.expiration() / 1000);

        if (StringUtils.hasText(properties.cookieDomain())) {
            cookieBuilder.domain(properties.cookieDomain());
        }

        return cookieBuilder.build().toString();
    }

    public String buildClearRefreshTokenCookie() {
        String path = StringUtils.hasText(properties.cookiePath()) ? properties.cookiePath() : "/";
        String sameSite = StringUtils.hasText(properties.sameSite()) ? properties.sameSite() : "Lax";

        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from(properties.cookieName(), "")
                .httpOnly(properties.httpOnly())
                .secure(properties.secure())
                .path(path)
                .sameSite(sameSite)
                .maxAge(0);

        if (StringUtils.hasText(properties.cookieDomain())) {
            cookieBuilder.domain(properties.cookieDomain());
        }

        return cookieBuilder.build().toString();
    }

    public String extractRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null || cookies.length == 0) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (properties.cookieName().equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
