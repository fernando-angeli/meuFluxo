package com.meufluxo.dto.user;

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
