package com.meufluxo.dto;

import java.time.LocalDateTime;

public record BaseResponse(
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        boolean active
) {
}
