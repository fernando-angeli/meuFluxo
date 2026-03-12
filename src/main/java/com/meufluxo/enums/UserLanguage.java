package com.meufluxo.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum UserLanguage {

    PT_BR("pt-BR"),
    EN("en"),
    ES("es");

    private final String code;

    UserLanguage(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    public static UserLanguage fromCode(String code) {
        for (UserLanguage language : values()) {
            if (language.code.equalsIgnoreCase(code)) {
                return language;
            }
        }

        throw new IllegalArgumentException("Unsupported language: " + code);
    }
}
