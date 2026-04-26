package com.meufluxo.controller;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.dto.creditCardInvoicePayment.CreditCardInvoicePaymentRequest;
import com.meufluxo.dto.creditCardInvoicePayment.CreditCardInvoicePaymentResponse;
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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;

@RestController
@RequestMapping({"/credit-card-invoice-payments", "/credit_card_invoice_payments"})
@Tag(name = "Pagamentos de Fatura", description = "Cadastro e consulta de pagamentos de faturas de cartão")
public class CreditCardInvoicePaymentController {

    private final CreditCardInvoicePaymentService service;

    public CreditCardInvoicePaymentController(CreditCardInvoicePaymentService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Registrar pagamento de fatura", description = "Suporta pagamento parcial; recalcula totais e status da fatura.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Pagamento registrado",
                    content = @Content(schema = @Schema(implementation = CreditCardInvoicePaymentResponse.class))),
            @ApiResponse(responseCode = "422", description = "Regra de negócio violada", content = @Content)
    })
    public ResponseEntity<CreditCardInvoicePaymentResponse> create(
            @Valid @RequestBody CreditCardInvoicePaymentRequest request
    ) {
        CreditCardInvoicePaymentResponse created = service.create(request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(uri).body(created);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar pagamento por ID")
    public ResponseEntity<CreditCardInvoicePaymentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    @Operation(summary = "Listar pagamentos", description = "Lista com paginação e filtros por fatura, conta e intervalo de data de pagamento.")
    public PageResponse<CreditCardInvoicePaymentResponse> getAll(
            @RequestParam(required = false) Long invoiceId,
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate paymentDateStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate paymentDateEnd,
            @PageableDefault(page = 0, size = 20, sort = "paymentDate", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return service.findByFilters(invoiceId, accountId, paymentDateStart, paymentDateEnd, pageable);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir pagamento de fatura", description = "Desfaz impacto financeiro na conta, remove pagamento e recalcula a fatura.")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
