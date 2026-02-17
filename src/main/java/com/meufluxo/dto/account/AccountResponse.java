package com.meufluxo.dto.account;

import com.meufluxo.dto.BaseResponse;
import com.meufluxo.enums.AccountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AccountResponse(

        Long id,
        String name,
        AccountType accountType,
        BigDecimal currentBalance,
        LocalDateTime balanceUpdatedAt,
        BaseResponse meta

) {
}
