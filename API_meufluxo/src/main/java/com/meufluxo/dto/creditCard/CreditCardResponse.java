package com.meufluxo.dto.creditCard;

import com.meufluxo.dto.BaseResponse;
import com.meufluxo.enums.BrandCard;

import java.math.BigDecimal;

public record CreditCardResponse(
        Long id,
        String name,
        String lastFourDigits,
        BigDecimal creditLimit,
        Integer closingDay,
        Integer dueDay,
        Boolean annualFeeEnabled,
        BigDecimal annualFeeAmount,
        BrandCard brandCard,
        BigDecimal annualFeeWaiverThreshold,
        Long defaultPaymentAccountId,
        BaseResponse meta
){}

