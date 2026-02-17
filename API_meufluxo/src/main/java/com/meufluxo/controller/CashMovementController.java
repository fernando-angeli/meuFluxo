package com.meufluxo.controller;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.dto.cashMovement.CashMovementRequest;
import com.meufluxo.dto.cashMovement.CashMovementResponse;
import com.meufluxo.dto.cashMovement.CashMovementUpdateRequest;
import com.meufluxo.service.CashMovementService;
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
public class CashMovementController {

    private final CashMovementService service;

    public CashMovementController(CashMovementService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CashMovementResponse>  create(@Valid @RequestBody CashMovementRequest request){
        CashMovementResponse cashMovement = service.create(request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(cashMovement.id()).toUri();
        return ResponseEntity.created(uri).body(cashMovement);
    }

    @GetMapping("{id}")
    public ResponseEntity<CashMovementResponse> getMovementById(@PathVariable Long id) {
        CashMovementResponse response = service.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping()
    public PageResponse<CashMovementResponse> getMovementByFilters(
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) Long categoryId,
            @PageableDefault(
                    page = 0,
                    size = 20,
                    sort = "occurredAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {
        return service.findByFilters(accountId, categoryId, pageable);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CashMovementResponse> updateMovement(
            @Valid @RequestBody CashMovementUpdateRequest request,
            @PathVariable Long id){
        CashMovementResponse updatedCashMovement = service.update(id, request);
        return ResponseEntity.ok(updatedCashMovement);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCashMovement(@PathVariable Long id){
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
