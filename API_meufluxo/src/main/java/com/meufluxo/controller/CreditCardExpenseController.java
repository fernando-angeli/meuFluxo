package com.meufluxo.controller;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.dto.creditCardExpense.CreditCardExpenseCreateResponse;
import com.meufluxo.dto.creditCardExpense.CreditCardExpenseRequest;
import com.meufluxo.dto.creditCardExpense.CreditCardExpenseResponse;
import com.meufluxo.dto.creditCardExpense.CreditCardExpenseUpdateRequest;
import com.meufluxo.service.CreditCardExpenseService;
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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping({"/credit-card-expenses", "/credit_card_expenses"})
@Tag(name = "Lançamentos de Cartão", description = "Cadastro, consulta, edição e cancelamento de gastos de cartão")
public class CreditCardExpenseController {

    private final CreditCardExpenseService service;

    public CreditCardExpenseController(CreditCardExpenseService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Criar lançamento de cartão", description = "Aceita lançamento único ou parcelado a partir de totalAmount/installmentCount.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Lançamento(s) criado(s)",
                    content = @Content(schema = @Schema(implementation = CreditCardExpenseCreateResponse.class))),
            @ApiResponse(responseCode = "422", description = "Regra de negócio violada", content = @Content)
    })
    public ResponseEntity<CreditCardExpenseCreateResponse> create(
            @Valid @RequestBody CreditCardExpenseRequest request
    ) {
        CreditCardExpenseCreateResponse response = service.create(request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(response.expenses().getFirst().id()).toUri();
        return ResponseEntity.created(uri).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar lançamento por ID")
    public ResponseEntity<CreditCardExpenseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    @Operation(summary = "Listar lançamentos", description = "Lista lançamentos com paginação e filtros por cartão/fatura/categoria/subcategoria/data/grupo de parcelas.")
    public PageResponse<CreditCardExpenseResponse> getAll(
            @RequestParam(required = false) Long creditCardId,
            @RequestParam(required = false) Long invoiceId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long subcategoryId,
            @RequestParam(required = false) UUID installmentGroupId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate purchaseDateStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate purchaseDateEnd,
            @PageableDefault(page = 0, size = 20, sort = "purchaseDate", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return service.findByFilters(
                creditCardId,
                invoiceId,
                categoryId,
                subcategoryId,
                purchaseDateStart,
                purchaseDateEnd,
                installmentGroupId,
                pageable
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar lançamento", description = "Permite edição apenas para faturas OPEN.")
    public ResponseEntity<CreditCardExpenseResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreditCardExpenseUpdateRequest request
    ) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancelar lançamento", description = "Marca lançamento como CANCELED e recalcula totais da fatura.")
    public ResponseEntity<CreditCardExpenseResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(service.cancel(id));
    }
}
