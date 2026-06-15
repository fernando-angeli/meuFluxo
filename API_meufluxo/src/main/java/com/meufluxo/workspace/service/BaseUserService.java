package com.meufluxo.workspace.service;

import com.meufluxo.workspace.model.Workspace;
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
