package com.meufluxo.bank.controller;

import com.meufluxo.bank.dto.BankResponse;
import com.meufluxo.bank.service.BankService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/banks")
@Tag(name = "Bancos", description = "Consulta de bancos disponíveis")
public class BankController {

    private final BankService bankService;

    public BankController(BankService bankService) {
        this.bankService = bankService;
    }

    @GetMapping
    @Operation(summary = "Listar bancos")
    public List<BankResponse> getBanks() {
        return bankService.getBanks();
    }
}
