package com.meufluxo.controller;

import com.meufluxo.dto.bootstrap.BootstrapResponse;
import com.meufluxo.service.BootstrapService;
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
@RequestMapping("/bootstrap")
@Tag(name = "Bootstrap", description = "Carga inicial para cache local do frontend")
public class BootstrapController {

    private final BootstrapService bootstrapService;

    public BootstrapController(BootstrapService bootstrapService) {
        this.bootstrapService = bootstrapService;
    }

    @GetMapping
    @Operation(summary = "Carregar bootstrap", description = "Retorna os dados base do workspace ativo para popular o cache local.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Bootstrap retornado com sucesso",
                    content = @Content(schema = @Schema(implementation = BootstrapResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token inválido ou ausente", content = @Content)
    })
    public ResponseEntity<BootstrapResponse> getBootstrap() {
        return ResponseEntity.ok(bootstrapService.getBootstrap());
    }
}
