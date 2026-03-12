package com.meufluxo.converter;

import com.meufluxo.enums.UserLanguage;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class UserLanguageConverter implements AttributeConverter<UserLanguage, String> {

    @Override
    public String convertToDatabaseColumn(UserLanguage attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public UserLanguage convertToEntityAttribute(String dbData) {
        return dbData == null ? null : UserLanguage.fromCode(dbData);
    }
}
