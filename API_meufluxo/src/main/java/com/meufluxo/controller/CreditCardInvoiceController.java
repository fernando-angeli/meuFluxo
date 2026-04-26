package com.meufluxo.controller;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.dto.creditCardInvoice.CreditCardInvoiceDetailsResponse;
import com.meufluxo.dto.creditCardInvoice.CreditCardInvoiceListResponse;
import com.meufluxo.dto.creditCardInvoice.CreditCardInvoiceResponse;
import com.meufluxo.dto.creditCardInvoicePayment.CreditCardInvoicePaymentByInvoiceRequest;
import com.meufluxo.dto.creditCardInvoicePayment.CreditCardInvoicePaymentResponse;
import com.meufluxo.enums.CreditCardInvoiceStatus;
import com.meufluxo.service.CreditCardInvoiceService;
import com.meufluxo.service.CreditCardInvoicePaymentService;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;

@RestController
@RequestMapping({"/credit-card-invoices", "/credit_card_invoices"})
@Tag(name = "Faturas de Cartão", description = "Consulta de faturas e detalhe para UI")
public class CreditCardInvoiceController {

    private final CreditCardInvoiceService service;
    private final CreditCardInvoicePaymentService paymentService;

    public CreditCardInvoiceController(
            CreditCardInvoiceService service,
            CreditCardInvoicePaymentService paymentService
    ) {
        this.service = service;
        this.paymentService = paymentService;
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

    @PostMapping("/{id}/payments")
    @Operation(summary = "Registrar pagamento da fatura", description = "Aceita pagamento total ou parcial. Após pagamento parcial, a fatura fica com status de pagamento parcial.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Pagamento registrado",
                    content = @Content(schema = @Schema(implementation = CreditCardInvoicePaymentResponse.class))),
            @ApiResponse(responseCode = "422", description = "Regra de negócio violada", content = @Content)
    })
    public ResponseEntity<CreditCardInvoicePaymentResponse> createPayment(
            @PathVariable Long id,
            @Valid @RequestBody CreditCardInvoicePaymentByInvoiceRequest request
    ) {
        CreditCardInvoicePaymentResponse created = paymentService.createForInvoice(id, request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{paymentId}")
                .buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(uri).body(created);
    }
}
