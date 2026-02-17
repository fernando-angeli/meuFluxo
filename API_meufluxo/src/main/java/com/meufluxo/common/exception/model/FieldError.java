package com.meufluxo.common.exception.model;

public record FieldError(
        String field,
        String message
) {
}
