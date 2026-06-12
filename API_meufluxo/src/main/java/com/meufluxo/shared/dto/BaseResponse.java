package com.meufluxo.shared.dto;

import java.time.LocalDateTime;

public record BaseResponse(
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        boolean active
) {
}
