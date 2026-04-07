package com.meufluxo.service;

import com.meufluxo.model.CreditCard;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;

@Service
public class CreditCardInvoiceCalculationService {

    public InvoiceCalculationResult calculate(CreditCard creditCard, LocalDate purchaseDate) {
        int closingDay = creditCard.getClosingDay();
        int dueDay = creditCard.getDueDay();

        YearMonth purchaseMonth = YearMonth.from(purchaseDate);
        YearMonth dueMonth = purchaseDate.getDayOfMonth() <= closingDay
                ? purchaseMonth
                : purchaseMonth.plusMonths(1);

        LocalDate closingDate = toSafeDate(dueMonth, closingDay);
        LocalDate dueDate = toSafeDate(dueMonth, dueDay);
        LocalDate previousClosingDate = toSafeDate(dueMonth.minusMonths(1), closingDay);
        LocalDate periodStart = previousClosingDate.plusDays(1);
        LocalDate periodEnd = closingDate;

        return new InvoiceCalculationResult(
                dueMonth.getYear(),
                dueMonth.getMonthValue(),
                periodStart,
                periodEnd,
                closingDate,
                dueDate
        );
    }

    private LocalDate toSafeDate(YearMonth yearMonth, int configuredDay) {
        int day = Math.min(configuredDay, yearMonth.lengthOfMonth());
        return yearMonth.atDay(day);
    }

    public record InvoiceCalculationResult(
            Integer referenceYear,
            Integer referenceMonth,
            LocalDate periodStart,
            LocalDate periodEnd,
            LocalDate closingDate,
            LocalDate dueDate
    ) {
    }
}
