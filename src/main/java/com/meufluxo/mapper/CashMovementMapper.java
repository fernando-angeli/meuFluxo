package com.meufluxo.mapper;

import com.meufluxo.dto.BaseResponse;
import com.meufluxo.dto.cashMovement.CashMovementRequest;
import com.meufluxo.dto.cashMovement.CashMovementResponse;
import com.meufluxo.model.CashMovement;
import com.meufluxo.model.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Mapper(componentModel = "spring")
public interface CashMovementMapper {

    CashMovement toEntity(CashMovementRequest request);

    @Mapping(target = "meta", source = ".")
    @Mapping(target = "referenceMonth",
            expression = "java(formatMonth(cashMovement.getReferenceMonth()))")
    CashMovementResponse toResponse(CashMovement cashMovement);

    BaseResponse toBaseResponse(CashMovement cashMovement);

    default String formatMonth(LocalDate date) {
        return date == null
                ? null
                : date.format(DateTimeFormatter.ofPattern("MM/yyyy"));
    }


}
