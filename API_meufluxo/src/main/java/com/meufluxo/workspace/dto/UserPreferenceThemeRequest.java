package com.meufluxo.workspace.dto;

import com.meufluxo.workspace.model.UserLanguage;
import com.meufluxo.workspace.model.UserTheme;
import jakarta.validation.constraints.NotNull;

public record UserPreferenceThemeRequest(
        @NotNull(message = "Tema é obrigatório.")
        UserTheme theme
) {
}
