package com.meufluxo.controller;

import com.meufluxo.dto.workspace.WorkspaceSyncStateResponse;
import com.meufluxo.service.WorkspaceAccessService;
import com.meufluxo.service.WorkspaceSyncStateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/workspaces")
@Tag(name = "Workspace Sync", description = "Estado de sincronização por workspace")
public class WorkspaceSyncStateController {

    private final WorkspaceSyncStateService workspaceSyncStateService;
    private final WorkspaceAccessService workspaceAccessService;

    public WorkspaceSyncStateController(
            WorkspaceSyncStateService workspaceSyncStateService,
            WorkspaceAccessService workspaceAccessService
    ) {
        this.workspaceSyncStateService = workspaceSyncStateService;
        this.workspaceAccessService = workspaceAccessService;
    }

    @GetMapping("/{workspaceId}/sync-state")
    @Operation(summary = "Consultar sync-state", description = "Retorna as versões atuais de dados cacheáveis do workspace.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Sync-state retornado com sucesso",
                    content = @Content(schema = @Schema(implementation = WorkspaceSyncStateResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token inválido ou ausente", content = @Content),
            @ApiResponse(responseCode = "404", description = "Workspace não encontrado para o usuário", content = @Content)
    })
    public ResponseEntity<WorkspaceSyncStateResponse> getSyncState(@PathVariable Long workspaceId) {
        workspaceAccessService.validateCurrentUserMembership(workspaceId);
        return ResponseEntity.ok(workspaceSyncStateService.getResponseByWorkspaceId(workspaceId));
    }
}
