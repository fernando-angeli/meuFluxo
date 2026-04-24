package com.meufluxo.controller;

import com.meufluxo.common.filter.RequestParamListParser;
import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.dto.plannedEntry.PlannedEntryBatchCreateRequest;
import com.meufluxo.dto.plannedEntry.PlannedEntryBatchCreateResponse;
import com.meufluxo.dto.plannedEntry.PlannedEntryCreateRequest;
import com.meufluxo.dto.plannedEntry.PlannedEntryFutureOpenUpdateRequest;
import com.meufluxo.dto.plannedEntry.PlannedEntryFutureOpenUpdateResponse;
import com.meufluxo.dto.plannedEntry.PlannedEntryResponse;
import com.meufluxo.dto.plannedEntry.PlannedEntrySettleRequest;
import com.meufluxo.dto.plannedEntry.PlannedEntryUpdateRequest;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.util.MultiValueMap;

@RestController
@RequestMapping({"/income", "/incomes"})
@Tag(name = "Receitas Planejadas", description = "Operações de lançamentos planejados de receitas")
public class IncomeController {

    private final PlannedEntryService plannedEntryService;

    public IncomeController(PlannedEntryService plannedEntryService) {
        this.plannedEntryService = plannedEntryService;
    }

    @PostMapping
    @Operation(summary = "Criar receita única planejada")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Receita criada",
                    content = @Content(schema = @Schema(implementation = PlannedEntryResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content)
    })
    public ResponseEntity<PlannedEntryResponse> createIncome(@Valid @RequestBody PlannedEntryCreateRequest request) {
        PlannedEntryResponse response = plannedEntryService.createIncome(request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(response.id()).toUri();
        return ResponseEntity.created(uri).body(response);
    }

    @PostMapping("/batch")
    @Operation(summary = "Criar lote manual de receitas")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Lote criado",
                    content = @Content(schema = @Schema(implementation = PlannedEntryBatchCreateResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content)
    })
    public ResponseEntity<PlannedEntryBatchCreateResponse> createIncomeBatch(
            @Valid @RequestBody PlannedEntryBatchCreateRequest request
    ) {
        PlannedEntryBatchCreateResponse response = plannedEntryService.createIncomeBatch(request);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar receita planejada por ID")
    public ResponseEntity<PlannedEntryResponse> getIncomeById(
            @Parameter(description = "ID do lançamento", example = "1", required = true)
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(plannedEntryService.findIncomeById(id));
    }

    @GetMapping
    @Operation(summary = "Listar receitas planejadas com filtros")
    public PageResponse<PlannedEntryResponse> getIncomes(
            @RequestParam(name = "status", required = false) List<PlannedEntryStatus> statuses,
            @RequestParam(required = false) PlannedAmountBehavior amountBehavior,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issueDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issueDateStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issueDateEnd,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDateStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDateEnd,
            @RequestParam(required = false) String document,
            @RequestParam(required = false) UUID groupId,
            @RequestParam MultiValueMap<String, String> queryParams,
            @PageableDefault(
                    page = 0,
                    size = 20,
                    sort = "dueDate",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable
    ) {
        List<Long> categoryIds = RequestParamListParser.parseLongList(
                queryParams,
                "categoryIds",
                "categoryId"
        );
        List<Long> subCategoryIds = RequestParamListParser.parseLongList(
                queryParams,
                "subCategoryIds",
                "subcategoryIds",
                "subCategoryId",
                "subcategoryId"
        );
        List<Long> accountIds = RequestParamListParser.parseLongList(
                queryParams,
                "accountIds",
                "accountId"
        );

        return plannedEntryService.findIncomes(
                statuses,
                amountBehavior,
                issueDate,
                issueDateStart,
                issueDateEnd,
                dueDateStart,
                dueDateEnd,
                document,
                categoryIds,
                subCategoryIds,
                accountIds,
                groupId,
                pageable
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar receita planejada individual")
    public ResponseEntity<PlannedEntryResponse> updateIncome(
            @PathVariable Long id,
            @Valid @RequestBody PlannedEntryUpdateRequest request
    ) {
        return ResponseEntity.ok(plannedEntryService.updateIncome(id, request));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancelar receita planejada")
    public ResponseEntity<PlannedEntryResponse> cancelIncome(@PathVariable Long id) {
        return ResponseEntity.ok(plannedEntryService.cancelIncome(id));
    }

    @PatchMapping("/{id}/settle")
    @Operation(summary = "Confirmar recebimento da receita planejada (gera movimento em conta)")
    public ResponseEntity<PlannedEntryResponse> settleIncome(
            @PathVariable Long id,
            @Valid @RequestBody PlannedEntrySettleRequest request
    ) {
        return ResponseEntity.ok(plannedEntryService.settleIncome(id, request));
    }

    @PutMapping("/{id}/future-open")
    @Operation(summary = "Atualizar próximos lançamentos em aberto do grupo")
    public ResponseEntity<PlannedEntryFutureOpenUpdateResponse> updateFutureOpen(
            @PathVariable Long id,
            @Valid @RequestBody PlannedEntryFutureOpenUpdateRequest request
    ) {
        return ResponseEntity.ok(plannedEntryService.updateIncomeFutureOpen(id, request));
    }
}
