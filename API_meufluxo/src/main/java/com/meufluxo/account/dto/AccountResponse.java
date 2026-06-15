package com.meufluxo.account.dto;

import com.meufluxo.shared.dto.BaseResponse;
import com.meufluxo.account.model.AccountType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AccountResponse(

        Long id,
        String name,
        AccountType accountType,
        boolean status,
        Integer bankCode,
        String bankName,
        String agency,
        String accountNumber,
        LocalDate initialBalanceDate,
        BigDecimal currentBalance,
        BigDecimal overdraftLimit,
        BigDecimal overdraftUsed,
        BigDecimal overdraftAvailable,
        BigDecimal availableBalance,
        boolean isUsingOverdraft,
        boolean isLimitExceeded,
        BigDecimal overdraftUsagePercent,
        LocalDateTime balanceUpdatedAt,
        BaseResponse meta

) {
}
