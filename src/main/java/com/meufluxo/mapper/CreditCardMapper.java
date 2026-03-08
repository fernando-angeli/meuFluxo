package com.meufluxo.mapper;

import com.meufluxo.dto.BaseResponse;
import com.meufluxo.dto.creditCard.CreditCardRequest;
import com.meufluxo.dto.creditCard.CreditCardResponse;
import com.meufluxo.model.CreditCard;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CreditCardMapper {

    CreditCard toEntity(CreditCardRequest request);

    @Mapping(target = "meta", source = ".")
    CreditCardResponse toResponse(CreditCard creditCard);

    BaseResponse toBaseResponse(CreditCard creditCard);

}
