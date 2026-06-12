package com.meufluxo.account.dto;

import java.math.BigDecimal;

public record AccountSimpleResponse(

        Long id,
        String name,
        BigDecimal currentBalance

) {
}
