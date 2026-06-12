package com.meufluxo.workspace.dto;

import com.meufluxo.workspace.model.UserLanguage;
import com.meufluxo.workspace.model.UserTheme;

public record UserPreferenceRequest(
        UserLanguage language,
        UserTheme theme,
        String currency,
        String dateFormat,
        String timezone
) {
}
