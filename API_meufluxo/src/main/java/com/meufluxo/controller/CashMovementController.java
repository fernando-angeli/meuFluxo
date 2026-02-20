package com.meufluxo.controller;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.dto.cashMovement.CashMovementRequest;
import com.meufluxo.dto.cashMovement.CashMovementResponse;
import com.meufluxo.dto.cashMovement.CashMovementUpdateRequest;
import com.meufluxo.service.CashMovementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping(value = "/cash-movement")
@Tag(name = "Movimentações", description = "Operações de movimentações do fluxo de caixa (criar, listar, atualizar, excluir)")
public class CashMovementController {

    private final CashMovementService service;

    public CashMovementController(CashMovementService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(
            summary = "Criar movimentação",
            description = "Cria uma movimentação de caixa e aplica o impacto no saldo da conta conforme regras de negócio."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Movimentação criada",
                    content = @Content(schema = @Schema(implementation = CashMovementResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Conta ou categoria não encontrada", content = @Content),
            @ApiResponse(responseCode = "409", description = "Regra de negócio violada", content = @Content)
    })
    public ResponseEntity<CashMovementResponse> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "Dados para criação da movimentação",
                    content = @Content(schema = @Schema(implementation = CashMovementRequest.class))
            )
            @Valid @RequestBody CashMovementRequest request
    ) {
        CashMovementResponse cashMovement = service.create(request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(cashMovement.id()).toUri();
        return ResponseEntity.created(uri).body(cashMovement);
    }

    @GetMapping("{id}")
    @Operation(
            summary = "Buscar movimentação por ID",
            description = "Retorna os dados da movimentação correspondente ao ID informado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Movimentação encontrada",
                    content = @Content(schema = @Schema(implementation = CashMovementResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Movimentação não encontrada", content = @Content),
            @ApiResponse(responseCode = "400", description = "Parâmetros inválidos", content = @Content)
    })
    public ResponseEntity<CashMovementResponse> getMovementById(
            @Parameter(description = "ID da movimentação", example = "1", required = true)
            @PathVariable Long id
    ) {
        CashMovementResponse response = service.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping()
    @Operation(
            summary = "Listar movimentações por filtros",
            description = "Lista movimentações com paginação, ordenação e filtros opcionais por conta e categoria."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Parâmetros inválidos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Conta ou categoria não encontrada (se informado)", content = @Content)
    })
    public PageResponse<CashMovementResponse> getMovementByFilters(
            @Parameter(description = "Filtrar pelo ID da conta (opcional)", example = "10")
            @RequestParam(required = false) Long accountId,

            @Parameter(description = "Filtrar pelo ID da categoria (opcional)", example = "3")
            @RequestParam(required = false) Long categoryId,

            @Parameter(description = "Paginação e ordenação (page, size, sort)")
            @PageableDefault(
                    page = 0,
                    size = 20,
                    sort = "occurredAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {
        return service.findByFilters(accountId, categoryId, pageable);
    }

    @PatchMapping("/{id}")
    @Operation(
            summary = "Atualizar movimentação (parcial)",
            description = "Atualiza somente os campos enviados. O impacto no saldo é revertido e reaplicado com os novos valores."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Movimentação atualizada",
                    content = @Content(schema = @Schema(implementation = CashMovementResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Movimentação/conta/categoria não encontrada", content = @Content),
            @ApiResponse(responseCode = "409", description = "Regra de negócio violada", content = @Content)
    })
    public ResponseEntity<CashMovementResponse> updateMovement(
            @Parameter(description = "ID da movimentação", example = "1", required = true)
            @PathVariable Long id,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "Campos para atualização parcial",
                    content = @Content(schema = @Schema(implementation = CashMovementUpdateRequest.class))
            )
            @Valid @RequestBody CashMovementUpdateRequest request
    ) {
        CashMovementResponse updatedCashMovement = service.update(id, request);
        return ResponseEntity.ok(updatedCashMovement);
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Excluir movimentação",
            description = "Exclui uma movimentação. (Recomendação: avaliar restrições futuras, como faturas fechadas.)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Movimentação excluída", content = @Content),
            @ApiResponse(responseCode = "404", description = "Movimentação não encontrada", content = @Content),
            @ApiResponse(responseCode = "409", description = "Regra de negócio violada", content = @Content)
    })
    public ResponseEntity<Void> deleteCashMovement(
            @Parameter(description = "ID da movimentação", example = "1", required = true)
            @PathVariable Long id
    ) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
