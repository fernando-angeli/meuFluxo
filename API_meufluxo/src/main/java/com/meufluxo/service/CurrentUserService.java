package com.meufluxo.service;

import com.meufluxo.model.workspaceAndUsers.Workspace;
import com.meufluxo.model.workspaceAndUsers.WorkspaceUser;
import com.meufluxo.model.workspaceAndUsers.User;
import com.meufluxo.model.workspaceAndUsers.UserPreference;
import com.meufluxo.repository.WorkspaceRepository;
import com.meufluxo.repository.UserRepository;
import com.meufluxo.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserWorkspaceService userWorkspaceService;
    private final UserPreferenceService userPreferenceService;

    public CurrentUserService(
            UserRepository userRepository,
            WorkspaceRepository workspaceRepository,
            UserWorkspaceService userWorkspaceService,
            UserPreferenceService userPreferenceService
    ) {
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
        this.userWorkspaceService = userWorkspaceService;
        this.userPreferenceService = userPreferenceService;
    }

    public Long getCurrentUserId(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.getId();
        }

        return null;
    }

    public Long getCurrentWorkspaceId() {
        return getCurrentWorkspace().getId();
    }

    public User getCurrentUser(){
        Long currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            throw new RuntimeException("Usuário autenticado não encontrado.");
        }

        return userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Usuário autenticado não encontrado."));
    }

    public Workspace getCurrentWorkspace() {
        User user = getCurrentUser();
        List<WorkspaceUser> memberships = userWorkspaceService.getActiveMemberships(user.getId());
        if (memberships.isEmpty()) {
            throw new RuntimeException("Workspace do usuário autenticado não encontrado.");
        }

        UserPreference preference = userPreferenceService.getOrCreate(user, memberships);
        Workspace activeWorkspace = preference.getActiveWorkspace();
        if (activeWorkspace == null) {
            throw new RuntimeException("Workspace ativo do usuário autenticado não encontrado.");
        }

        return workspaceRepository.findById(activeWorkspace.getId())
                .orElseThrow(() -> new RuntimeException("Workspace do usuário autenticado não encontrado."));
    }
}
