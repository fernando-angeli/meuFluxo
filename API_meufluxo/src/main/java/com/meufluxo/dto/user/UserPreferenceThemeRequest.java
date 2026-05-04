package com.meufluxo.dto.user;

import com.meufluxo.enums.UserLanguage;
import com.meufluxo.enums.UserTheme;
import jakarta.validation.constraints.NotNull;

public record UserPreferenceThemeRequest(
        @NotNull(message = "Tema é obrigatório.")
        UserTheme theme
) {
}
