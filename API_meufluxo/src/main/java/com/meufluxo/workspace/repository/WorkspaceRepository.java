package com.meufluxo.workspace.repository;

import com.meufluxo.workspace.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {

    Optional<Workspace> findByNameIgnoreCase(String name);
}
