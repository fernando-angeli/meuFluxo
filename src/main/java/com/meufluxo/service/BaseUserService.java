package com.meufluxo.service;

import com.meufluxo.model.workspaceAndUsers.Workspace;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public abstract class BaseUserService {

    protected final CurrentUserService currentUserService;

    protected Workspace getCurrentWorkspace() {
        return currentUserService.getCurrentWorkspace();
    }

    protected Long getCurrentWorkspaceId() {
        return currentUserService.getCurrentWorkspaceId();
    }
}
