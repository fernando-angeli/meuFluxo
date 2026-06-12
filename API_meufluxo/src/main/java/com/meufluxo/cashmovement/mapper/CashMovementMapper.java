package com.meufluxo.cashmovement.mapper;

import com.meufluxo.shared.dto.BaseResponse;
import com.meufluxo.cashmovement.dto.CashMovementRequest;
import com.meufluxo.cashmovement.dto.CashMovementResponse;
import com.meufluxo.cashmovement.model.CashMovement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Mapper(componentModel = "spring")
public interface CashMovementMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "subCategory", ignore = true)
    @Mapping(target = "account", ignore = true)
    @Mapping(target = "workspace", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "creditCardInvoice", ignore = true)
    @Mapping(target = "referenceMonth", ignore = true)
    CashMovement toEntity(CashMovementRequest request);

    @Mapping(target = "meta", source = ".")
    @Mapping(target = "referenceMonth",
            expression = "java(formatMonth(cashMovement.getReferenceMonth()))")
    @Mapping(target = "creditCardInvoiceId", source = "creditCardInvoice.id")
    @Mapping(target = "creditCardInvoiceDueDate", source = "creditCardInvoice.dueDate")
    CashMovementResponse toResponse(CashMovement cashMovement);

    BaseResponse toBaseResponse(CashMovement cashMovement);

    default String formatMonth(LocalDate date) {
        return date == null
                ? null
                : date.format(DateTimeFormatter.ofPattern("MM/yyyy"));
    }


}
