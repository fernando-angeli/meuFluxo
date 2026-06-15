package com.meufluxo.account.messaging;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AccountMovementCommand(
        String commandId,
        String commandType,
        Long accountId,
        BigDecimal amount,
        String movementType,
        Long originMovementId,
        String originType,
        LocalDateTime issuedAt
) {
}
