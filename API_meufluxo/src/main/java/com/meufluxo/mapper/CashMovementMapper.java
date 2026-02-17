package com.meufluxo.mapper;

import com.meufluxo.dto.cashMovement.CashMovementRequest;
import com.meufluxo.dto.cashMovement.CashMovementResponse;
import com.meufluxo.model.CashMovement;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CashMovementMapper {

    CashMovement toEntity(CashMovementRequest cashMovementCreateRequest);

    CashMovementResponse toResponse(CashMovement cashMovement);

}
