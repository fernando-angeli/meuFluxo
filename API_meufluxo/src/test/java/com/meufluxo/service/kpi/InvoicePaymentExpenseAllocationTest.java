package com.meufluxo.service.kpi;

import com.meufluxo.dto.kpi.InvoicePaymentAllocationLineResponse;
import com.meufluxo.enums.CreditCardExpenseStatus;
import com.meufluxo.enums.MovementType;
import com.meufluxo.model.Category;
import com.meufluxo.model.CreditCardExpense;
import com.meufluxo.model.SubCategory;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InvoicePaymentExpenseAllocationTest {

    @Test
    void fullPaymentSplitsProportionally() {
        Category energy = new Category();
        energy.setId(1L);
        energy.setName("Energia");
        energy.setMovementType(MovementType.EXPENSE);
        SubCategory energySub = new SubCategory();
        energySub.setId(11L);
        energySub.setName("Conta luz");
        energySub.setCategory(energy);

        Category food = new Category();
        food.setId(2L);
        food.setName("Alimentação");
        food.setMovementType(MovementType.EXPENSE);
        SubCategory foodSub = new SubCategory();
        foodSub.setId(22L);
        foodSub.setName("Supermercado");
        foodSub.setCategory(food);

        CreditCardExpense e1 = new CreditCardExpense();
        e1.setId(100L);
        e1.setCategory(energy);
        e1.setSubcategory(energySub);
        e1.setAmount(new BigDecimal("60.00"));
        e1.setStatus(CreditCardExpenseStatus.OPEN);
        e1.setDescription("Luz");

        CreditCardExpense e2 = new CreditCardExpense();
        e2.setId(101L);
        e2.setCategory(food);
        e2.setSubcategory(foodSub);
        e2.setAmount(new BigDecimal("40.00"));
        e2.setStatus(CreditCardExpenseStatus.OPEN);
        e2.setDescription("Mercado");

        List<InvoicePaymentAllocationLineResponse> lines = InvoicePaymentExpenseAllocation.toAllocationLines(
                new BigDecimal("100.00"),
                List.of(e1, e2)
        );

        assertEquals(2, lines.size());
        assertEquals(0, new BigDecimal("60.00").compareTo(lines.getFirst().allocatedAmount()));
        assertEquals(0, new BigDecimal("40.00").compareTo(lines.get(1).allocatedAmount()));
        assertEquals("Energia", lines.getFirst().categoryName());
        assertEquals("Alimentação", lines.get(1).categoryName());
    }

    @Test
    void partialPaymentUsesSameRatio() {
        Category c = new Category();
        c.setId(1L);
        c.setName("Cat");
        c.setMovementType(MovementType.EXPENSE);
        CreditCardExpense e1 = new CreditCardExpense();
        e1.setId(1L);
        e1.setCategory(c);
        e1.setSubcategory(null);
        e1.setAmount(new BigDecimal("30.00"));
        e1.setStatus(CreditCardExpenseStatus.OPEN);
        e1.setDescription("A");

        CreditCardExpense e2 = new CreditCardExpense();
        e2.setId(2L);
        e2.setCategory(c);
        e2.setSubcategory(null);
        e2.setAmount(new BigDecimal("70.00"));
        e2.setStatus(CreditCardExpenseStatus.OPEN);
        e2.setDescription("B");

        List<InvoicePaymentAllocationLineResponse> lines = InvoicePaymentExpenseAllocation.toAllocationLines(
                new BigDecimal("50.00"),
                List.of(e1, e2)
        );

        assertEquals(2, lines.size());
        assertEquals(0, new BigDecimal("15.00").compareTo(lines.getFirst().allocatedAmount()));
        assertEquals(0, new BigDecimal("35.00").compareTo(lines.get(1).allocatedAmount()));
    }

    @Test
    void canceledExpenseExcluded() {
        Category c = new Category();
        c.setId(1L);
        c.setName("Cat");
        c.setMovementType(MovementType.EXPENSE);

        CreditCardExpense open = new CreditCardExpense();
        open.setId(1L);
        open.setCategory(c);
        open.setSubcategory(null);
        open.setAmount(new BigDecimal("100.00"));
        open.setStatus(CreditCardExpenseStatus.OPEN);
        open.setDescription("Open");

        CreditCardExpense canceled = new CreditCardExpense();
        canceled.setId(2L);
        canceled.setCategory(c);
        canceled.setSubcategory(null);
        canceled.setAmount(new BigDecimal("50.00"));
        canceled.setStatus(CreditCardExpenseStatus.CANCELED);
        canceled.setDescription("Canceled");

        List<InvoicePaymentAllocationLineResponse> lines = InvoicePaymentExpenseAllocation.toAllocationLines(
                new BigDecimal("100.00"),
                List.of(open, canceled)
        );

        assertEquals(1, lines.size());
        assertEquals(0, new BigDecimal("100.00").compareTo(lines.getFirst().allocatedAmount()));
    }

    @Test
    void zeroEligibleReturnsEmpty() {
        List<InvoicePaymentAllocationLineResponse> lines = InvoicePaymentExpenseAllocation.toAllocationLines(
                new BigDecimal("10.00"),
                List.of()
        );
        assertTrue(lines.isEmpty());
    }
}
