package com.meufluxo.controller;

import com.meufluxo.dto.auth.LoginRequest;
import com.meufluxo.dto.auth.LoginResponse;
import com.meufluxo.dto.auth.RefreshResponse;
import com.meufluxo.security.RefreshTokenCookieService;
import com.meufluxo.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@Tag(name = "Autenticação", description = "Operações de autenticação")
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenCookieService refreshTokenCookieService;

    public AuthController(AuthService authService, RefreshTokenCookieService refreshTokenCookieService) {
        this.authService = authService;
        this.refreshTokenCookieService = refreshTokenCookieService;
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticar usuário", description = "Realiza login com email e senha e retorna access token e cookie HttpOnly de refresh token.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login realizado com sucesso",
                    content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "400", description = "Payload inválido", content = @Content),
            @ApiResponse(responseCode = "401", description = "Credenciais inválidas", content = @Content)
    })
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpServletRequest
    ) {
        AuthService.LoginResult result = authService.login(
                request,
                httpServletRequest.getHeader("User-Agent"),
                extractClientIp(httpServletRequest)
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookieService.buildRefreshTokenCookie(result.refreshToken()))
                .body(result.response());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar sessão", description = "Usa cookie HttpOnly de refresh token para emitir novo access token e rotacionar refresh token.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Sessão renovada com sucesso",
                    content = @Content(schema = @Schema(implementation = RefreshResponse.class))),
            @ApiResponse(responseCode = "401", description = "Refresh token inválido ou expirado", content = @Content)
    })
    public ResponseEntity<RefreshResponse> refresh(HttpServletRequest httpServletRequest) {
        String refreshToken = refreshTokenCookieService.extractRefreshToken(httpServletRequest);

        AuthService.RefreshResult result = authService.refresh(
                refreshToken,
                httpServletRequest.getHeader("User-Agent"),
                extractClientIp(httpServletRequest)
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookieService.buildRefreshTokenCookie(result.refreshToken()))
                .body(result.response());
    }

    @PostMapping("/logout")
    @Operation(summary = "Encerrar sessão", description = "Revoga refresh token atual e remove cookie HttpOnly.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Logout realizado com sucesso", content = @Content)
    })
    public ResponseEntity<Void> logout(HttpServletRequest httpServletRequest) {
        String refreshToken = refreshTokenCookieService.extractRefreshToken(httpServletRequest);
        authService.logout(refreshToken);

        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookieService.buildClearRefreshTokenCookie())
                .build();
    }

    private static String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            String[] ips = xForwardedFor.split(",");
            return ips[0].trim();
        }
        return request.getRemoteAddr();
    }
}
