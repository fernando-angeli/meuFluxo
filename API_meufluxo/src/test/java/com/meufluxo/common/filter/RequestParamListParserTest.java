package com.meufluxo.common.filter;

import com.meufluxo.common.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class RequestParamListParserTest {

    @Test
    void parseLongListShouldSupportCommaSeparatedAndLegacySingular() {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("accountIds", "1,2");
        params.add("accountId", "3");

        List<Long> ids = RequestParamListParser.parseLongList(params, "accountIds", "accountId");

        assertEquals(List.of(1L, 2L, 3L), ids);
    }

    @Test
    void parseLongListShouldIgnoreEmptyValues() {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("subcategoryIds", "");
        params.add("subcategoryIds", "   ");

        List<Long> ids = RequestParamListParser.parseLongList(params, "subcategoryIds");

        assertNull(ids);
    }

    @Test
    void parseLongListShouldFailForInvalidId() {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("categoryIds", "10,abc");

        assertThrows(
                BusinessException.class,
                () -> RequestParamListParser.parseLongList(params, "categoryIds")
        );
    }
}
