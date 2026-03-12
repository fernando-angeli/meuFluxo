package com.meufluxo.repository;

import com.meufluxo.model.workspaceAndUsers.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {

    Optional<Workspace> findByNameIgnoreCase(String name);
}
