package com.meufluxo.dto.account;

import java.time.LocalDateTime;

public record AccountDetailsMetaResponse(
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        boolean active,
        Long createdByUserId,
        String createdByUserName,
        Long updatedByUserId,
        String updatedByUserName
) {
}
