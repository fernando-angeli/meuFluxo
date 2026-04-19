package com.meufluxo.controller;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.dto.plannedEntry.*;
import com.meufluxo.enums.PlannedAmountBehavior;
import com.meufluxo.enums.PlannedEntryStatus;
import com.meufluxo.service.PlannedEntryService;
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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping({"/expense", "/expenses"})
@Tag(name = "Despesas Planejadas", description = "Operações de lançamentos planejados de despesas")
public class ExpenseController {

    private final PlannedEntryService plannedEntryService;

    public ExpenseController(PlannedEntryService plannedEntryService) {
        this.plannedEntryService = plannedEntryService;
    }

    @PostMapping
    @Operation(summary = "Criar despesa única planejada")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Despesa criada",
                    content = @Content(schema = @Schema(implementation = PlannedEntryResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content)
    })
    public ResponseEntity<PlannedEntryResponse> createExpense(@Valid @RequestBody PlannedEntryCreateRequest request) {
        PlannedEntryResponse response = plannedEntryService.createExpense(request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(response.id()).toUri();
        return ResponseEntity.created(uri).body(response);
    }

    @PostMapping("/batch")
    @Operation(summary = "Criar lote manual de despesas")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Lote criado",
                    content = @Content(schema = @Schema(implementation = PlannedEntryBatchCreateResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content)
    })
    public ResponseEntity<PlannedEntryBatchCreateResponse> createExpenseBatch(
            @Valid @RequestBody PlannedEntryBatchCreateRequest request
    ) {
        PlannedEntryBatchCreateResponse response = plannedEntryService.createExpenseBatch(request);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar despesa planejada por ID")
    public ResponseEntity<PlannedEntryResponse> getExpenseById(
            @Parameter(description = "ID do lançamento", example = "1", required = true)
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(plannedEntryService.findExpenseById(id));
    }

    @GetMapping
    @Operation(summary = "Listar despesas planejadas com filtros")
    public PageResponse<PlannedEntryResponse> getExpenses(
            @RequestParam(required = false) PlannedEntryStatus status,
            @RequestParam(required = false) PlannedAmountBehavior amountBehavior,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issueDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issueDateStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issueDateEnd,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDateStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDateEnd,
            @RequestParam(required = false) String document,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long subCategoryId,
            @RequestParam(required = false) UUID groupId,
            @PageableDefault(
                    page = 0,
                    size = 20,
                    sort = "dueDate",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable
    ) {
        return plannedEntryService.findExpenses(
                status,
                amountBehavior,
                issueDate,
                issueDateStart,
                issueDateEnd,
                dueDateStart,
                dueDateEnd,
                document,
                categoryId,
                subCategoryId,
                groupId,
                pageable
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar despesa planejada individual")
    public ResponseEntity<PlannedEntryResponse> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody PlannedEntryUpdateRequest request
    ) {
        return ResponseEntity.ok(plannedEntryService.updateExpense(id, request));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancelar despesa planejada")
    public ResponseEntity<PlannedEntryResponse> cancelExpense(@PathVariable Long id) {
        return ResponseEntity.ok(plannedEntryService.cancelExpense(id));
    }

    @PatchMapping("/{id}/settle")
    @Operation(summary = "Liquidar despesa planejada (gera movimento em conta)")
    public ResponseEntity<PlannedEntryResponse> settleExpense(
            @PathVariable Long id,
            @Valid @RequestBody PlannedEntrySettleRequest request
    ) {
        return ResponseEntity.ok(plannedEntryService.settleExpense(id, request));
    }

    @PutMapping("/{id}/future-open")
    @Operation(summary = "Atualizar próximos lançamentos em aberto do grupo")
    public ResponseEntity<PlannedEntryFutureOpenUpdateResponse> updateFutureOpen(
            @PathVariable Long id,
            @Valid @RequestBody PlannedEntryFutureOpenUpdateRequest request
    ) {
        return ResponseEntity.ok(plannedEntryService.updateExpenseFutureOpen(id, request));
    }
}
