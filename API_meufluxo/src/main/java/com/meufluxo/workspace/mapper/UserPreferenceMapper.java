package com.meufluxo.workspace.mapper;

import com.meufluxo.workspace.dto.UserPreferenceResponse;
import com.meufluxo.workspace.model.UserPreference;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserPreferenceMapper {

    UserPreferenceResponse toResponse(UserPreference preference);
}
