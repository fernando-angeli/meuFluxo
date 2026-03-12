package com.meufluxo.controller;

import com.meufluxo.dto.user.AuthenticatedUserResponse;
import com.meufluxo.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@Tag(name = "Usuários", description = "Operações do usuário autenticado")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/me")
    @Operation(summary = "Buscar usuário autenticado", description = "Retorna os dados básicos do usuário logado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário autenticado retornado com sucesso",
                    content = @Content(schema = @Schema(implementation = AuthenticatedUserResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token inválido ou ausente", content = @Content)
    })
    public ResponseEntity<AuthenticatedUserResponse> me() {
        return ResponseEntity.ok(authService.getAuthenticatedUser());
    }
}
