package com.meufluxo.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum UserTheme {

    LIGHT("light"),
    DARK("dark"),
    SYSTEM("system");

    private final String code;

    UserTheme(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    public static UserTheme fromCode(String code) {
        for (UserTheme theme : values()) {
            if (theme.code.equalsIgnoreCase(code)) {
                return theme;
            }
        }

        throw new IllegalArgumentException("Unsupported theme: " + code);
    }
}
