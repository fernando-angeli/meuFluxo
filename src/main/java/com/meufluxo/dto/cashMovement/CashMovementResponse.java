package com.meufluxo.dto.cashMovement;

import com.meufluxo.dto.account.AccountSimpleResponse;
import com.meufluxo.dto.category.CategorySimpleResponse;
import com.meufluxo.enums.MovementType;
import com.meufluxo.enums.PaymentMethod;

import java.math.BigDecimal;

public record CashMovementResponse(

        Long id,
        String description,
        PaymentMethod paymentMethod,
        BigDecimal amount,
        MovementType movementType,
        AccountSimpleResponse account,
        CategorySimpleResponse category

) {
}
