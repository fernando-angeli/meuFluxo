package com.meufluxo.workspace.dto;

import java.util.List;

public record AuthenticatedUserResponse(
        Long id,
        String name,
        String email,
        UserPreferenceResponse preferences,
        WorkspaceSummaryResponse activeWorkspace,
        List<UserWorkspaceResponse> workspaces
) {
}
