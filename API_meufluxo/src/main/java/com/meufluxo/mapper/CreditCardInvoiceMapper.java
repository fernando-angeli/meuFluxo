package com.meufluxo.mapper;

import com.meufluxo.dto.creditCardInvoice.CreditCardInvoiceListResponse;
import com.meufluxo.dto.creditCardInvoice.CreditCardInvoiceResponse;
import com.meufluxo.model.CreditCardInvoice;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CreditCardInvoiceMapper {

    @Mapping(target = "creditCardId", source = "creditCard.id")
    @Mapping(target = "creditCardName", source = "creditCard.name")
    @Mapping(target = "cardDisplayName", expression = "java(toCardDisplayName(invoice))")
    @Mapping(target = "referenceLabel", expression = "java(toReferenceLabel(invoice))")
    @Mapping(target = "statusLabel", expression = "java(toStatusLabel(invoice))")
    CreditCardInvoiceResponse toResponse(CreditCardInvoice invoice);

    @Mapping(target = "creditCardId", source = "creditCard.id")
    @Mapping(target = "creditCardName", source = "creditCard.name")
    @Mapping(target = "cardDisplayName", expression = "java(toCardDisplayName(invoice))")
    @Mapping(target = "referenceLabel", expression = "java(toReferenceLabel(invoice))")
    @Mapping(target = "statusLabel", expression = "java(toStatusLabel(invoice))")
    CreditCardInvoiceListResponse toListResponse(CreditCardInvoice invoice);

    default String toReferenceLabel(CreditCardInvoice invoice) {
        if (invoice == null || invoice.getReferenceMonth() == null || invoice.getReferenceYear() == null) {
            return null;
        }
        return String.format("%02d/%04d", invoice.getReferenceMonth(), invoice.getReferenceYear());
    }

    default String toStatusLabel(CreditCardInvoice invoice) {
        if (invoice == null || invoice.getStatus() == null) {
            return null;
        }
        return invoice.getStatus().getLabelPtBr();
    }

    default String toCardDisplayName(CreditCardInvoice invoice) {
        if (invoice == null || invoice.getCreditCard() == null) {
            return null;
        }
        if (invoice.getCreditCard().getBrand() == null) {
            return invoice.getCreditCard().getName();
        }
        return invoice.getCreditCard().getName() + " - " + invoice.getCreditCard().getBrand().name();
    }
}
