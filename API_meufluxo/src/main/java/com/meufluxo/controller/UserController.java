package com.meufluxo.controller;

import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.dto.user.AuthenticatedUserResponse;
import com.meufluxo.dto.user.UserPreferenceResponse;
import com.meufluxo.dto.user.UserPreferenceThemeRequest;
import com.meufluxo.service.AuthService;
import com.meufluxo.service.CurrentUserService;
import com.meufluxo.service.UserPreferenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@Tag(name = "Usuários", description = "Operações do usuário autenticado")
public class UserController {

    private final AuthService authService;
    private final UserPreferenceService userPreferenceService;
    private final CurrentUserService currentUserService;

    public UserController(
            AuthService authService,
            UserPreferenceService userPreferenceService,
            CurrentUserService currentUserService
    ) {
        this.authService = authService;
        this.userPreferenceService = userPreferenceService;
        this.currentUserService = currentUserService;
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

    @PatchMapping("/{id}/preferences/theme")
    @Operation(
            summary = "Atualizar tema do usuário",
            description = "Atualiza o tema escolhido (light, dark ou system)."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Tema atualizado",
                    content = @Content(schema = @Schema(implementation = UserPreferenceResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Preferências não encontradas", content = @Content)
    })
    public ResponseEntity<UserPreferenceResponse> userThemeUpdate(
            @PathVariable Long id,
            @Valid @RequestBody UserPreferenceThemeRequest request
    ) {
        Long currentUserId = currentUserService.getCurrentUserId();
        if (currentUserId == null || !currentUserId.equals(id)) {
            throw new BusinessException("Você só pode atualizar suas próprias preferências.");
        }

        UserPreferenceResponse response = userPreferenceService.updateTheme(id, request.theme());
        return ResponseEntity.ok(response);
    }
}
