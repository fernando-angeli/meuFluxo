package com.meufluxo.service.kpi;

import com.meufluxo.dto.kpi.InvoicePaymentAllocationLineResponse;
import com.meufluxo.enums.CreditCardExpenseStatus;
import com.meufluxo.enums.MovementType;
import com.meufluxo.model.CreditCardExpense;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Distribui o valor de um pagamento de fatura de cartão nas categorias reais das despesas do cartão.
 * Base do rateio: soma dos valores das despesas elegíveis (não canceladas) na fatura.
 */
public final class InvoicePaymentExpenseAllocation {

    private InvoicePaymentExpenseAllocation() {
    }

    public static List<InvoicePaymentAllocationLineResponse> toAllocationLines(
            BigDecimal paymentAmount,
            List<CreditCardExpense> invoiceExpenses
    ) {
        if (paymentAmount == null || paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return List.of();
        }
        List<CreditCardExpense> eligible = invoiceExpenses.stream()
                .filter(e -> e.getStatus() != CreditCardExpenseStatus.CANCELED)
                .toList();
        BigDecimal totalEligible = eligible.stream()
                .map(CreditCardExpense::getAmount)
                .filter(a -> a != null && a.compareTo(BigDecimal.ZERO) > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (totalEligible.compareTo(BigDecimal.ZERO) <= 0) {
            return List.of();
        }

        List<InvoicePaymentAllocationLineResponse> out = new ArrayList<>();
        BigDecimal allocatedSoFar = BigDecimal.ZERO;
        int n = eligible.size();
        for (int i = 0; i < n; i++) {
            CreditCardExpense e = eligible.get(i);
            BigDecimal expenseAmount = defaultZero(e.getAmount());
            BigDecimal share;
            if (i == n - 1) {
                share = paymentAmount.subtract(allocatedSoFar).max(BigDecimal.ZERO);
            } else {
                share = paymentAmount
                        .multiply(expenseAmount)
                        .divide(totalEligible, 2, RoundingMode.HALF_UP);
                allocatedSoFar = allocatedSoFar.add(share);
            }
            if (share.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            var category = e.getCategory();
            var sub = e.getSubcategory();
            if (sub == null) {
                out.add(new InvoicePaymentAllocationLineResponse(
                        e.getId(),
                        category.getId(),
                        category.getName(),
                        category.getMovementType(),
                        category.getId(),
                        "—",
                        e.getDescription() != null ? e.getDescription() : "—",
                        share
                ));
            } else {
                out.add(new InvoicePaymentAllocationLineResponse(
                        e.getId(),
                        category.getId(),
                        category.getName(),
                        category.getMovementType(),
                        sub.getId(),
                        sub.getName(),
                        e.getDescription() != null ? e.getDescription() : "—",
                        share
                ));
            }
        }
        return out;
    }

    private static BigDecimal defaultZero(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }

    public record KpiAmountLineView(
            MovementType movementType,
            BigDecimal amount,
            Long categoryId,
            String categoryName,
            MovementType categoryMovementType,
            Long subCategoryId,
            String subCategoryName
    ) {
    }

    public static List<KpiAmountLineView> allocationToKpiLineViews(List<InvoicePaymentAllocationLineResponse> allocations) {
        List<KpiAmountLineView> lines = new ArrayList<>();
        for (InvoicePaymentAllocationLineResponse a : allocations) {
            lines.add(new KpiAmountLineView(
                    MovementType.EXPENSE,
                    a.allocatedAmount(),
                    a.categoryId(),
                    a.categoryName(),
                    a.categoryMovementType(),
                    a.subCategoryId(),
                    a.subCategoryName()
            ));
        }
        return lines;
    }
}
