package com.meufluxo.controller;

import com.meufluxo.dto.auth.LoginRequest;
import com.meufluxo.dto.auth.LoginResponse;
import com.meufluxo.dto.auth.RefreshResponse;
import com.meufluxo.security.RefreshTokenCookieService;
import com.meufluxo.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private RefreshTokenCookieService refreshTokenCookieService;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private AuthController controller;

    @Test
    void loginShouldReturnAccessTokenAndRefreshCookie() {
        LoginRequest request = new LoginRequest("user@mail.com", "123456");
        LoginResponse response = new LoginResponse("access-token", "Bearer", 900);
        AuthService.LoginResult result = new AuthService.LoginResult(response, "refresh-token");

        when(this.request.getHeader("User-Agent")).thenReturn("JUnit");
        when(this.request.getRemoteAddr()).thenReturn("127.0.0.1");
        when(authService.login(any(), any(), any())).thenReturn(result);
        when(refreshTokenCookieService.buildRefreshTokenCookie("refresh-token"))
                .thenReturn("mf_refresh_token=refresh-token; Path=/; HttpOnly");

        ResponseEntity<LoginResponse> entity = controller.login(request, this.request);

        assertEquals(200, entity.getStatusCode().value());
        assertEquals("mf_refresh_token=refresh-token; Path=/; HttpOnly", entity.getHeaders().getFirst("Set-Cookie"));
        assertNotNull(entity.getBody());
        assertEquals("access-token", entity.getBody().accessToken());
        assertEquals("Bearer", entity.getBody().tokenType());
        assertEquals(900, entity.getBody().expiresIn());
    }

    @Test
    void refreshShouldRotateCookieAndReturnNewAccessToken() {
        RefreshResponse response = new RefreshResponse("new-access-token", "Bearer", 900);
        AuthService.RefreshResult result = new AuthService.RefreshResult(response, "next-refresh-token");

        when(request.getHeader("User-Agent")).thenReturn("JUnit");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        when(refreshTokenCookieService.extractRefreshToken(any())).thenReturn("old-refresh-token");
        when(authService.refresh(eq("old-refresh-token"), any(), any())).thenReturn(result);
        when(refreshTokenCookieService.buildRefreshTokenCookie("next-refresh-token"))
                .thenReturn("mf_refresh_token=next-refresh-token; Path=/; HttpOnly");

        ResponseEntity<RefreshResponse> entity = controller.refresh(request);

        assertEquals(200, entity.getStatusCode().value());
        assertEquals("mf_refresh_token=next-refresh-token; Path=/; HttpOnly", entity.getHeaders().getFirst("Set-Cookie"));
        assertNotNull(entity.getBody());
        assertEquals("new-access-token", entity.getBody().accessToken());
    }

    @Test
    void refreshShouldFailWhenTokenIsInvalid() {
        when(refreshTokenCookieService.extractRefreshToken(any())).thenReturn("invalid-token");
        when(authService.refresh(eq("invalid-token"), any(), any()))
                .thenThrow(new BadCredentialsException("Refresh token inválido."));
        when(request.getHeader("User-Agent")).thenReturn("JUnit");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        assertThrows(BadCredentialsException.class, () -> controller.refresh(request));
    }

    @Test
    void logoutShouldRevokeSessionAndClearCookie() {
        when(refreshTokenCookieService.extractRefreshToken(any())).thenReturn("refresh-token");
        when(refreshTokenCookieService.buildClearRefreshTokenCookie())
                .thenReturn("mf_refresh_token=; Path=/; Max-Age=0; HttpOnly");

        ResponseEntity<Void> entity = controller.logout(request);

        assertEquals(204, entity.getStatusCode().value());
        assertEquals("mf_refresh_token=; Path=/; Max-Age=0; HttpOnly", entity.getHeaders().getFirst("Set-Cookie"));
        verify(authService).logout("refresh-token");
    }
}
