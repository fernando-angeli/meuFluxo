package com.meufluxo.service;

import com.meufluxo.dto.auth.LoginRequest;
import com.meufluxo.dto.auth.LoginResponse;
import com.meufluxo.dto.user.AuthenticatedUserResponse;
import com.meufluxo.dto.user.UserPreferenceResponse;
import com.meufluxo.dto.user.UserWorkspaceResponse;
import com.meufluxo.dto.user.WorkspaceSummaryResponse;
import com.meufluxo.model.workspaceAndUsers.User;
import com.meufluxo.model.workspaceAndUsers.UserPreference;
import com.meufluxo.model.workspaceAndUsers.WorkspaceUser;
import com.meufluxo.security.CustomUserDetails;
import com.meufluxo.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CurrentUserService currentUserService;
    private final UserWorkspaceService userWorkspaceService;
    private final UserPreferenceService userPreferenceService;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            CurrentUserService currentUserService,
            UserWorkspaceService userWorkspaceService,
            UserPreferenceService userPreferenceService
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.currentUserService = currentUserService;
        this.userWorkspaceService = userWorkspaceService;
        this.userPreferenceService = userPreferenceService;
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(request.email(), request.password())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails);

        return new LoginResponse(token, "Bearer", jwtService.getExpirationInSeconds());
    }

    public AuthenticatedUserResponse getAuthenticatedUser() {
        User user = currentUserService.getCurrentUser();
        List<WorkspaceUser> memberships = userWorkspaceService.getActiveMemberships(user.getId());
        UserPreference preference = userPreferenceService.getOrCreate(user, memberships);

        WorkspaceSummaryResponse activeWorkspace = preference.getActiveWorkspace() == null
                ? null
                : new WorkspaceSummaryResponse(
                        preference.getActiveWorkspace().getId(),
                        preference.getActiveWorkspace().getName()
                );

        List<UserWorkspaceResponse> workspaces = memberships.stream()
                .map(membership -> new UserWorkspaceResponse(
                        membership.getWorkspace().getId(),
                        membership.getWorkspace().getName(),
                        membership.getRole()
                ))
                .toList();

        return new AuthenticatedUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                new UserPreferenceResponse(
                        preference.getLanguage(),
                        preference.getTheme(),
                        preference.getCurrency(),
                        preference.getDateFormat(),
                        preference.getTimezone()
                ),
                activeWorkspace,
                workspaces
        );
    }
}
