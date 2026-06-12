package com.meufluxo.workspace.dto;

import com.meufluxo.workspace.model.WorkspaceRole;

public record UserWorkspaceResponse(
        Long id,
        String name,
        WorkspaceRole role
) {
}
