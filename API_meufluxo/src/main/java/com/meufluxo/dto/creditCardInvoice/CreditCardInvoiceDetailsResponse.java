package com.meufluxo.dto.creditCardInvoice;

import com.meufluxo.enums.BrandCard;
import com.meufluxo.enums.CreditCardInvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreditCardInvoiceDetailsResponse(
        Long id,
        Long creditCardId,
        String creditCardName,
        String cardDisplayName,
        BrandCard creditCardBrand,
        Integer closingDay,
        Integer dueDay,
        Integer referenceYear,
        Integer referenceMonth,
        String referenceLabel,
        LocalDate periodStart,
        LocalDate periodEnd,
        LocalDate closingDate,
        LocalDate dueDate,
        BigDecimal purchasesAmount,
        BigDecimal previousBalance,
        BigDecimal revolvingInterest,
        BigDecimal lateFee,
        BigDecimal otherCharges,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal remainingAmount,
        BigDecimal currentBalance,
        CreditCardInvoiceStatus status,
        String statusLabel,
        boolean canClose,
        boolean canPay,
        boolean canEditCharges,
        boolean canEditExpenses,
        List<CreditCardInvoiceDetailsExpenseItemResponse> expenses,
        List<CreditCardInvoiceDetailsPaymentItemResponse> payments
) {
}
