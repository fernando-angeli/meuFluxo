package com.meufluxo.controller;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.dto.creditCardInvoice.CreditCardInvoiceDetailsResponse;
import com.meufluxo.dto.creditCardInvoice.CreditCardInvoiceListResponse;
import com.meufluxo.dto.creditCardInvoice.CreditCardInvoiceResponse;
import com.meufluxo.enums.CreditCardInvoiceStatus;
import com.meufluxo.service.CreditCardInvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping({"/credit-card-invoices", "/credit_card_invoices"})
@Tag(name = "Faturas de Cartão", description = "Consulta de faturas e detalhe para UI")
public class CreditCardInvoiceController {

    private final CreditCardInvoiceService service;

    public CreditCardInvoiceController(CreditCardInvoiceService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar fatura por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Fatura encontrada",
                    content = @Content(schema = @Schema(implementation = CreditCardInvoiceResponse.class))),
            @ApiResponse(responseCode = "404", description = "Fatura não encontrada", content = @Content)
    })
    public ResponseEntity<CreditCardInvoiceResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    @Operation(summary = "Listar faturas", description = "Lista com filtros por cartão, status, referência e intervalo de vencimento.")
    public PageResponse<CreditCardInvoiceListResponse> getAll(
            @RequestParam(required = false) Long creditCardId,
            @RequestParam(required = false) CreditCardInvoiceStatus status,
            @RequestParam(required = false) Integer referenceYear,
            @RequestParam(required = false) Integer referenceMonth,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDateStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDateEnd,
            @PageableDefault(page = 0, size = 20, sort = "dueDate", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return service.findByFilters(
                creditCardId,
                status,
                referenceYear,
                referenceMonth,
                dueDateStart,
                dueDateEnd,
                pageable
        );
    }

    @GetMapping("/{id}/details")
    @Operation(summary = "Detalhar fatura para UI", description = "Retorna totais, lançamentos, pagamentos e indicadores de ação.")
    public ResponseEntity<CreditCardInvoiceDetailsResponse> getDetails(@PathVariable Long id) {
        return ResponseEntity.ok(service.getDetails(id));
    }
}
