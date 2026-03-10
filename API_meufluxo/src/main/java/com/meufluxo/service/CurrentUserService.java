package com.meufluxo.service;

import com.meufluxo.model.workspaceAndUsers.Workspace;
import com.meufluxo.model.workspaceAndUsers.User;
import com.meufluxo.repository.WorkspaceRepository;
import com.meufluxo.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;

    public CurrentUserService(UserRepository userRepository, WorkspaceRepository workspaceRepository) {
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
    }

    public Long getCurrentUserId(){
        return 2L;
    }

    public Long getCurrentWorkspaceId() {
        return 1L;
    }

    public User getCurrentUser(){
        return userRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Usuário mock não encontrado."));
    }

    public Workspace getCurrentWorkspace() {
        return workspaceRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Workspace mock não encontrado."));
    }
}
