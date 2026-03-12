package com.meufluxo.repository;

import com.meufluxo.model.workspaceAndUsers.WorkspaceSyncState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkspaceSyncStateRepository extends JpaRepository<WorkspaceSyncState, Long> {

    Optional<WorkspaceSyncState> findByWorkspaceId(Long workspaceId);
}
