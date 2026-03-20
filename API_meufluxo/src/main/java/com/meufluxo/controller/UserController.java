package com.meufluxo.controller;

import com.meufluxo.dto.user.AuthenticatedSessionResponse;
import com.meufluxo.service.AuthenticatedSessionService;
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

    private final AuthenticatedSessionService authenticatedSessionService;

    public UserController(AuthenticatedSessionService authenticatedSessionService) {
        this.authenticatedSessionService = authenticatedSessionService;
    }

    @GetMapping("/me")
    @Operation(
            summary = "Buscar sessão autenticada",
            description = "Retorna o payload unificado para inicialização da aplicação autenticada com base no workspace ativo."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Sessão autenticada retornada com sucesso",
                    content = @Content(schema = @Schema(implementation = AuthenticatedSessionResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token inválido ou ausente", content = @Content)
    })
    public ResponseEntity<AuthenticatedSessionResponse> me() {
        return ResponseEntity.ok(authenticatedSessionService.getAuthenticatedSession());
    }
}
