package com.meufluxo.workspace.converter;

import com.meufluxo.workspace.model.UserTheme;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class UserThemeConverter implements AttributeConverter<UserTheme, String> {

    @Override
    public String convertToDatabaseColumn(UserTheme attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public UserTheme convertToEntityAttribute(String dbData) {
        return dbData == null ? null : UserTheme.fromCode(dbData);
    }
}
