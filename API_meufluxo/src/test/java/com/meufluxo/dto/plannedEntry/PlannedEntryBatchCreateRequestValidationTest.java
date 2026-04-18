package com.meufluxo.dto.plannedEntry;

import com.meufluxo.enums.PlannedAmountBehavior;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PlannedEntryBatchCreateRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void shouldRejectEmptyEntries() {
        PlannedEntryBatchCreateRequest request = new PlannedEntryBatchCreateRequest(
                "Conta de luz",
                1L,
                null,
                PlannedAmountBehavior.ESTIMATED,
                null,
                null,
                null,
                null,
                List.of()
        );

        Set<ConstraintViolation<PlannedEntryBatchCreateRequest>> violations = validator.validate(request);

        assertTrue(containsViolation(violations, "entries", "Lista de lançamentos é obrigatória e não pode estar vazia."));
    }

    @Test
    void shouldRejectEntryWithNonPositiveExpectedAmount() {
        PlannedEntryBatchCreateRequest request = new PlannedEntryBatchCreateRequest(
                "Conta de luz",
                1L,
                null,
                PlannedAmountBehavior.ESTIMATED,
                null,
                null,
                null,
                null,
                List.of(new PlannedEntryBatchItemRequest(1, LocalDate.of(2026, 4, 10), null, null, BigDecimal.ZERO))
        );

        Set<ConstraintViolation<PlannedEntryBatchCreateRequest>> violations = validator.validate(request);

        assertTrue(containsViolation(violations, "entries[0].expectedAmount", "Valor esperado deve ser maior que zero."));
    }

    @Test
    void shouldRejectEntryWithoutDueDate() {
        PlannedEntryBatchCreateRequest request = new PlannedEntryBatchCreateRequest(
                "Conta de luz",
                1L,
                null,
                PlannedAmountBehavior.ESTIMATED,
                null,
                null,
                null,
                null,
                List.of(new PlannedEntryBatchItemRequest(1, null, null, null, new BigDecimal("99.90")))
        );

        Set<ConstraintViolation<PlannedEntryBatchCreateRequest>> violations = validator.validate(request);

        assertTrue(containsViolation(violations, "entries[0].dueDate", "Data de vencimento é obrigatória."));
    }

    @Test
    void shouldRejectEntryWithoutOrder() {
        PlannedEntryBatchCreateRequest request = new PlannedEntryBatchCreateRequest(
                "Conta de luz",
                1L,
                null,
                PlannedAmountBehavior.ESTIMATED,
                null,
                null,
                null,
                null,
                List.of(new PlannedEntryBatchItemRequest(null, LocalDate.of(2026, 4, 10), null, null, new BigDecimal("99.90")))
        );

        Set<ConstraintViolation<PlannedEntryBatchCreateRequest>> violations = validator.validate(request);

        assertTrue(containsViolation(violations, "entries[0].order", "Ordem é obrigatória."));
    }

    @Test
    void shouldRejectWhenCategoryIdIsMissing() {
        PlannedEntryBatchCreateRequest request = new PlannedEntryBatchCreateRequest(
                "Conta de luz",
                null,
                null,
                PlannedAmountBehavior.ESTIMATED,
                null,
                null,
                null,
                null,
                List.of(new PlannedEntryBatchItemRequest(1, LocalDate.of(2026, 4, 10), null, null, new BigDecimal("99.90")))
        );

        Set<ConstraintViolation<PlannedEntryBatchCreateRequest>> violations = validator.validate(request);

        assertTrue(containsViolation(violations, "categoryId", "Categoria é obrigatória."));
    }

    private static boolean containsViolation(
            Set<ConstraintViolation<PlannedEntryBatchCreateRequest>> violations,
            String propertyPath,
            String message
    ) {
        return violations.stream().anyMatch(v ->
                propertyPath.equals(v.getPropertyPath().toString()) && message.equals(v.getMessage())
        );
    }
}
