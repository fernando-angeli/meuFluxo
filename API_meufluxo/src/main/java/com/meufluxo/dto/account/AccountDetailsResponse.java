package com.meufluxo.dto.account;

import com.meufluxo.enums.AccountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AccountDetailsResponse(
        Long id,
        String name,
        AccountType accountType,
        boolean status,
        Integer bankCode,
        String bankName,
        String agency,
        String accountNumber,
        BigDecimal initialBalance,
        BigDecimal currentBalance,
        BigDecimal overdraftLimit,
        BigDecimal overdraftUsed,
        BigDecimal overdraftAvailable,
        BigDecimal availableBalance,
        boolean isUsingOverdraft,
        boolean isLimitExceeded,
        BigDecimal overdraftUsagePercent,
        LocalDateTime balanceUpdatedAt,
        AccountDetailsMetaResponse meta
) {
}
