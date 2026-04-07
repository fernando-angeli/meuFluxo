package com.meufluxo.controller;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.dto.creditCard.CreditCardActiveRequest;
import com.meufluxo.dto.creditCard.CreditCardRequest;
import com.meufluxo.dto.creditCard.CreditCardResponse;
import com.meufluxo.dto.creditCard.CreditCardUpdateRequest;
import com.meufluxo.service.CreditCardService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping({"/credit-cards", "/credit_cards"})
@Tag(name = "Cartões de Crédito", description = "CRUD e ativação/inativação de cartões de crédito")
public class CreditCardController {

    private final CreditCardService service;

    public CreditCardController(CreditCardService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar cartão por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cartão encontrado",
                    content = @Content(schema = @Schema(implementation = CreditCardResponse.class))),
            @ApiResponse(responseCode = "404", description = "Cartão não encontrado", content = @Content)
    })
    public ResponseEntity<CreditCardResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    @Operation(summary = "Listar cartões", description = "Lista cartões com paginação, ordenação e filtro opcional por ativo.")
    public PageResponse<CreditCardResponse> getAll(
            @RequestParam(required = false) Boolean active,
            @PageableDefault(page = 0, size = 20, sort = "name", direction = Sort.Direction.ASC)
            Pageable pageable
    ) {
        return service.getAll(active, pageable);
    }

    @PostMapping
    @Operation(summary = "Criar cartão")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Cartão criado",
                    content = @Content(schema = @Schema(implementation = CreditCardResponse.class))),
            @ApiResponse(responseCode = "422", description = "Regra de negócio violada", content = @Content)
    })
    public ResponseEntity<CreditCardResponse> create(@Valid @RequestBody CreditCardRequest request) {
        CreditCardResponse created = service.create(request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(uri).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar cartão")
    public ResponseEntity<CreditCardResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreditCardUpdateRequest request
    ) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @PatchMapping("/{id}/active")
    @Operation(summary = "Ativar/Inativar cartão")
    public ResponseEntity<CreditCardResponse> updateActive(
            @PathVariable Long id,
            @Valid @RequestBody CreditCardActiveRequest request
    ) {
        return ResponseEntity.ok(service.updateActive(id, request.active()));
    }
}
