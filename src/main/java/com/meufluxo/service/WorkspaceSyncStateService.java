package com.meufluxo.service;

import com.meufluxo.dto.workspace.WorkspaceSyncStateResponse;
import com.meufluxo.model.workspaceAndUsers.Workspace;
import com.meufluxo.model.workspaceAndUsers.WorkspaceSyncState;
import com.meufluxo.repository.WorkspaceSyncStateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class WorkspaceSyncStateService {

    private final WorkspaceSyncStateRepository workspaceSyncStateRepository;
    private final WorkspaceAccessService workspaceAccessService;

    public WorkspaceSyncStateService(
            WorkspaceSyncStateRepository workspaceSyncStateRepository,
            WorkspaceAccessService workspaceAccessService
    ) {
        this.workspaceSyncStateRepository = workspaceSyncStateRepository;
        this.workspaceAccessService = workspaceAccessService;
    }

    @Transactional
    public WorkspaceSyncState getOrCreateByWorkspaceId(Long workspaceId) {
        return workspaceSyncStateRepository.findByWorkspaceId(workspaceId)
                .orElseGet(() -> {
                    Workspace workspace = workspaceAccessService.getWorkspaceForCurrentUser(workspaceId);
                    WorkspaceSyncState syncState = new WorkspaceSyncState();
                    syncState.setWorkspace(workspace);
                    syncState.setCategoriesVersion(1L);
                    syncState.setAccountsVersion(1L);
                    syncState.setCreditCardsVersion(1L);
                    syncState.setUpdatedAt(LocalDateTime.now());
                    return workspaceSyncStateRepository.save(syncState);
                });
    }

    @Transactional
    public WorkspaceSyncStateResponse getResponseByWorkspaceId(Long workspaceId) {
        WorkspaceSyncState syncState = getOrCreateByWorkspaceId(workspaceId);
        return toResponse(syncState);
    }

    @Transactional
    public void incrementCategoriesVersion(Long workspaceId) {
        WorkspaceSyncState syncState = getOrCreateByWorkspaceId(workspaceId);
        syncState.setCategoriesVersion(syncState.getCategoriesVersion() + 1);
        syncState.setUpdatedAt(LocalDateTime.now());
        workspaceSyncStateRepository.save(syncState);
    }

    @Transactional
    public void incrementAccountsVersion(Long workspaceId) {
        WorkspaceSyncState syncState = getOrCreateByWorkspaceId(workspaceId);
        syncState.setAccountsVersion(syncState.getAccountsVersion() + 1);
        syncState.setUpdatedAt(LocalDateTime.now());
        workspaceSyncStateRepository.save(syncState);
    }

    @Transactional
    public void incrementCreditCardsVersion(Long workspaceId) {
        WorkspaceSyncState syncState = getOrCreateByWorkspaceId(workspaceId);
        syncState.setCreditCardsVersion(syncState.getCreditCardsVersion() + 1);
        syncState.setUpdatedAt(LocalDateTime.now());
        workspaceSyncStateRepository.save(syncState);
    }

    public WorkspaceSyncStateResponse toResponse(WorkspaceSyncState syncState) {
        return new WorkspaceSyncStateResponse(
                syncState.getWorkspace().getId(),
                syncState.getCategoriesVersion(),
                syncState.getAccountsVersion(),
                syncState.getCreditCardsVersion(),
                syncState.getUpdatedAt()
        );
    }
}
