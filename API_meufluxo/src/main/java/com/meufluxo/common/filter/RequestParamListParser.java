package com.meufluxo.common.filter;

import com.meufluxo.common.exception.BusinessException;
import org.springframework.util.MultiValueMap;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public final class RequestParamListParser {

    private RequestParamListParser() {
    }

    public static List<Long> parseLongList(
            MultiValueMap<String, String> queryParams,
            String... parameterNames
    ) {
        Set<Long> parsed = new LinkedHashSet<>();

        for (String parameterName : parameterNames) {
            List<String> rawValues = queryParams.get(parameterName);
            if (rawValues == null || rawValues.isEmpty()) {
                continue;
            }

            for (String rawValue : rawValues) {
                if (rawValue == null || rawValue.isBlank()) {
                    continue;
                }

                String[] tokens = rawValue.split(",");
                for (String token : tokens) {
                    String sanitized = token.trim();
                    if (sanitized.isEmpty()) {
                        continue;
                    }
                    try {
                        parsed.add(Long.parseLong(sanitized));
                    } catch (NumberFormatException ex) {
                        throw new BusinessException(
                                "Parâmetro inválido para filtro de IDs: " + parameterName + "=" + sanitized
                        );
                    }
                }
            }
        }

        if (parsed.isEmpty()) {
            return null;
        }
        return new ArrayList<>(parsed);
    }
}
