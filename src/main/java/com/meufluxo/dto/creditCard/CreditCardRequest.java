package com.meufluxo.dto.creditCard;

import com.meufluxo.enums.BrandCard;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CreditCardRequest(
        @NotBlank
        String name,

        @NotBlank
        @Pattern(regexp = "\\d{4}")
        String lastFourDigits,

        @NotNull
        BigDecimal creditLimit,

        @NotNull
        @Min(1)
        @Max(31)
        Integer closingDay,

        @NotNull
        @Min(1)
        @Max(31)
        Integer dueDay,

        @NotNull
        Boolean annualFeeEnabled,

        BigDecimal annualFeeAmount,

        @NotNull
        BrandCard brandCard,

        BigDecimal annualFeeWaiverThreshold,

        Long defaultPaymentAccountId
) {
}
