package com.meufluxo.dto.account;

import java.math.BigDecimal;

public record AccountSimpleResponse(

        Long id,
        String name,
        BigDecimal currentBalance

) {
}
