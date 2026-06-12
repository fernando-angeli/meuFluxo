package com.meufluxo.workspace.service;

import com.meufluxo.shared.exception.NotFoundException;
import com.meufluxo.workspace.model.Workspace;
import com.meufluxo.workspace.model.WorkspaceUser;
import com.meufluxo.workspace.repository.WorkspaceRepository;
import com.meufluxo.workspace.repository.WorkspaceUserRepository;
import org.springframework.stereotype.Service;

@Service
public class WorkspaceAccessService {

    private final CurrentUserService currentUserService;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceUserRepository workspaceUserRepository;

    public WorkspaceAccessService(
            CurrentUserService currentUserService,
            WorkspaceRepository workspaceRepository,
            WorkspaceUserRepository workspaceUserRepository
    ) {
        this.currentUserService = currentUserService;
        this.workspaceRepository = workspaceRepository;
        this.workspaceUserRepository = workspaceUserRepository;
    }

    public Workspace getWorkspaceForCurrentUser(Long workspaceId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        if (currentUserId == null) {
            throw new NotFoundException("Usuário autenticado não encontrado.");
        }

        WorkspaceUser membership = workspaceUserRepository.findActiveMembershipByUserIdAndWorkspaceId(currentUserId, workspaceId)
                .orElseThrow(() -> new NotFoundException("Workspace não encontrado para o usuário autenticado."));

        return workspaceRepository.findById(membership.getWorkspace().getId())
                .orElseThrow(() -> new NotFoundException("Workspace não encontrado."));
    }

    public void validateCurrentUserMembership(Long workspaceId) {
        getWorkspaceForCurrentUser(workspaceId);
    }
}
