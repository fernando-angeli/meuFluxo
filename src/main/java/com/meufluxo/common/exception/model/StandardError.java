package com.meufluxo.common.exception.model;

import java.time.Instant;
import java.util.List;

public record StandardError(
        Instant timestamp,
        Integer status,
        String title,
        String detail,
        String path,
        List<FieldError> errors
) {
}
