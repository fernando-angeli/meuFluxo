package com.meufluxo.creditcard.mapper;

import com.meufluxo.creditcard.dto.CreditCardRequest;
import com.meufluxo.creditcard.dto.CreditCardResponse;
import com.meufluxo.creditcard.model.CreditCard;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CreditCardMapper {

    CreditCard toEntity(CreditCardRequest request);

    @Mapping(target = "cardDisplayName", expression = "java(toCardDisplayName(creditCard))")
    @Mapping(target = "defaultPaymentAccountId", source = "defaultPaymentAccount.id")
    @Mapping(target = "defaultPaymentAccountName", source = "defaultPaymentAccount.name")
    CreditCardResponse toResponse(CreditCard creditCard);

    default String toCardDisplayName(CreditCard creditCard) {
        if (creditCard == null) {
            return null;
        }
        if (creditCard.getBrand() == null) {
            return creditCard.getName();
        }
        return creditCard.getName() + " - " + creditCard.getBrand().name();
    }
}
