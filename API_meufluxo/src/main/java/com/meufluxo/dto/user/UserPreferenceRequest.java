package com.meufluxo.dto.user;

import com.meufluxo.enums.UserLanguage;
import com.meufluxo.enums.UserTheme;

public record UserPreferenceRequest(
        UserLanguage language,
        UserTheme theme,
        String currency,
        String dateFormat,
        String timezone
) {
}
