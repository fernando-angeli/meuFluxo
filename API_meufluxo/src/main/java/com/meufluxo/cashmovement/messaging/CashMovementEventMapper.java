package com.meufluxo.cashmovement.messaging;

import com.meufluxo.cashmovement.messaging.CashMovementEvent;
import com.meufluxo.cashmovement.model.CashMovement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface CashMovementEventMapper {

    @Mapping(target = "eventId", ignore = true)
    @Mapping(target = "eventType", ignore = true)
    @Mapping(target = "occurredAt", ignore = true)
    @Mapping(target = "movementId", source = "id")
    @Mapping(target = "accountId", source = "account.id")
    @Mapping(target = "categoryId", source = "subCategory.category.id")
    @Mapping(target = "movementType", expression = "java(movement.getMovementType().name())")
    @Mapping(target = "movementDate", expression = "java(movement.getOccurredAt() != null ? movement.getOccurredAt().atStartOfDay() : null)")
    CashMovementEvent toEvent(CashMovement movement);
}
