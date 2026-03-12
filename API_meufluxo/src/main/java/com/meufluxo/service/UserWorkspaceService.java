package com.meufluxo.service;

import com.meufluxo.model.workspaceAndUsers.WorkspaceUser;
import com.meufluxo.repository.WorkspaceUserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserWorkspaceService {

    private final WorkspaceUserRepository workspaceUserRepository;

    public UserWorkspaceService(WorkspaceUserRepository workspaceUserRepository) {
        this.workspaceUserRepository = workspaceUserRepository;
    }

    public List<WorkspaceUser> getActiveMemberships(Long userId) {
        return workspaceUserRepository.findActiveMembershipsByUserId(userId);
    }
}
