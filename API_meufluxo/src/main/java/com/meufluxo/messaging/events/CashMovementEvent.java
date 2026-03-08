package com.meufluxo.messaging.events;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CashMovementEvent(
        String eventId,          // UUID
        String eventType,        // CREATED | UPDATED | DELETED
        LocalDateTime occurredAt,

        Long movementId,
        Long accountId,
        Long categoryId,

        BigDecimal amount,
        String movementType,     // INCOME | EXPENSE
        LocalDateTime movementDate
) {
}
