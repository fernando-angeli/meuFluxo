package com.meufluxo.dto.user;

import com.meufluxo.enums.WorkspaceRole;

public record UserWorkspaceResponse(
        Long id,
        String name,
        WorkspaceRole role
) {
}
