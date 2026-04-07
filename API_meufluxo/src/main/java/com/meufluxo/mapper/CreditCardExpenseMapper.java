package com.meufluxo.mapper;

import com.meufluxo.dto.creditCardExpense.CreditCardExpenseResponse;
import com.meufluxo.model.CreditCardExpense;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CreditCardExpenseMapper {

    @Mapping(target = "creditCardId", source = "creditCard.id")
    @Mapping(target = "creditCardName", source = "creditCard.name")
    @Mapping(target = "cardDisplayName", expression = "java(toCardDisplayName(expense))")
    @Mapping(target = "invoiceId", source = "invoice.id")
    @Mapping(target = "invoiceReference", expression = "java(formatInvoiceReference(expense))")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "subcategoryId", source = "subcategory.id")
    @Mapping(target = "subcategoryName", source = "subcategory.name")
    @Mapping(target = "statusLabel", expression = "java(toStatusLabel(expense))")
    CreditCardExpenseResponse toResponse(CreditCardExpense expense);

    default String formatInvoiceReference(CreditCardExpense expense) {
        if (expense == null || expense.getInvoice() == null
                || expense.getInvoice().getReferenceMonth() == null
                || expense.getInvoice().getReferenceYear() == null) {
            return null;
        }
        return String.format("%02d/%04d", expense.getInvoice().getReferenceMonth(), expense.getInvoice().getReferenceYear());
    }

    default String toStatusLabel(CreditCardExpense expense) {
        if (expense == null || expense.getStatus() == null) {
            return null;
        }
        return expense.getStatus().getLabelPtBr();
    }

    default String toCardDisplayName(CreditCardExpense expense) {
        if (expense == null || expense.getCreditCard() == null) {
            return null;
        }
        if (expense.getCreditCard().getBrand() == null) {
            return expense.getCreditCard().getName();
        }
        return expense.getCreditCard().getName() + " - " + expense.getCreditCard().getBrand().name();
    }
}
