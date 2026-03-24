package com.meufluxo.dto.account;

import com.meufluxo.enums.AccountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AccountDetailsResponse(
        Long id,
        String name,
        AccountType accountType,
        BigDecimal initialBalance,
        BigDecimal currentBalance,
        LocalDateTime balanceUpdatedAt,
        AccountDetailsMetaResponse meta
) {
}
