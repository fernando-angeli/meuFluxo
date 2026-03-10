package com.meufluxo.repository;

import com.meufluxo.model.workspaceAndUsers.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
}
