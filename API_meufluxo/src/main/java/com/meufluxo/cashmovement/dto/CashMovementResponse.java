package com.meufluxo.cashmovement.dto;

import com.meufluxo.shared.dto.BaseResponse;
import com.meufluxo.account.dto.AccountSimpleResponse;
import com.meufluxo.category.dto.SubCategorySimpleResponse;
import com.meufluxo.cashmovement.model.MovementType;
import com.meufluxo.cashmovement.model.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CashMovementResponse(

        Long id,
        String description,
        PaymentMethod paymentMethod,
        BigDecimal amount,
        LocalDate occurredAt,
        String referenceMonth,
        MovementType movementType,
        AccountSimpleResponse account,
        SubCategorySimpleResponse subCategory,
        Long creditCardInvoiceId,
        LocalDate creditCardInvoiceDueDate,
        BaseResponse meta
) {
}
