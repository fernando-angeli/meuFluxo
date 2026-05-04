package com.meufluxo.mapper;

import com.meufluxo.dto.user.UserPreferenceResponse;
import com.meufluxo.model.workspaceAndUsers.UserPreference;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserPreferenceMapper {

    UserPreferenceResponse toResponse(UserPreference preference);
}
