package com.meufluxo.mapper;

import com.meufluxo.dto.creditCardInvoicePayment.CreditCardInvoicePaymentResponse;
import com.meufluxo.model.CreditCardInvoicePayment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CreditCardInvoicePaymentMapper {

    @Mapping(target = "invoiceId", source = "invoice.id")
    @Mapping(target = "invoiceReference", expression = "java(toInvoiceReference(payment))")
    @Mapping(target = "accountId", source = "account.id")
    @Mapping(target = "accountName", source = "account.name")
    @Mapping(target = "movementId", source = "movement.id")
    CreditCardInvoicePaymentResponse toResponse(CreditCardInvoicePayment payment);

    default String toInvoiceReference(CreditCardInvoicePayment payment) {
        if (payment == null || payment.getInvoice() == null
                || payment.getInvoice().getReferenceMonth() == null
                || payment.getInvoice().getReferenceYear() == null) {
            return null;
        }
        return String.format("%02d/%04d", payment.getInvoice().getReferenceMonth(), payment.getInvoice().getReferenceYear());
    }
}
