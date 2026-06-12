package com.meufluxo.shared.exception.model;

public record FieldError(
        String field,
        String message
) {
}
