package com.meufluxo.service;

import com.meufluxo.dto.auth.LoginRequest;
import com.meufluxo.dto.auth.LoginResponse;
import com.meufluxo.dto.auth.RefreshResponse;
import com.meufluxo.dto.user.AuthenticatedUserResponse;
import com.meufluxo.dto.user.UserPreferenceResponse;
import com.meufluxo.dto.user.UserWorkspaceResponse;
import com.meufluxo.dto.user.WorkspaceSummaryResponse;
import com.meufluxo.model.workspaceAndUsers.User;
import com.meufluxo.model.workspaceAndUsers.UserPreference;
import com.meufluxo.model.workspaceAndUsers.WorkspaceUser;
import com.meufluxo.repository.UserRepository;
import com.meufluxo.security.CustomUserDetails;
import com.meufluxo.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class    AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RefreshTokenSessionService refreshTokenSessionService;
    private final CurrentUserService currentUserService;
    private final UserWorkspaceService userWorkspaceService;
    private final UserPreferenceService userPreferenceService;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            RefreshTokenSessionService refreshTokenSessionService,
            CurrentUserService currentUserService,
            UserWorkspaceService userWorkspaceService,
            UserPreferenceService userPreferenceService
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.refreshTokenSessionService = refreshTokenSessionService;
        this.currentUserService = currentUserService;
        this.userWorkspaceService = userWorkspaceService;
        this.userPreferenceService = userPreferenceService;
    }

    @Transactional
    public LoginResult login(LoginRequest request, String userAgent, String ipAddress) {
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(request.email(), request.password())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Usuário autenticado não encontrado."));

        String token = jwtService.generateToken(userDetails);
        RefreshTokenSessionService.IssuedRefreshToken issuedRefreshToken =
                refreshTokenSessionService.issue(user, userAgent, ipAddress);

        return new LoginResult(
                new LoginResponse(token, "Bearer", jwtService.getExpirationInSeconds()),
                issuedRefreshToken.rawToken()
        );
    }

    @Transactional
    public RefreshResult refresh(String refreshToken, String userAgent, String ipAddress) {
        RefreshTokenSessionService.IssuedRefreshToken rotated =
                refreshTokenSessionService.rotate(refreshToken, userAgent, ipAddress);

        CustomUserDetails userDetails = new CustomUserDetails(rotated.session().getUser());
        String accessToken = jwtService.generateToken(userDetails);

        return new RefreshResult(
                new RefreshResponse(accessToken, "Bearer", jwtService.getExpirationInSeconds()),
                rotated.rawToken()
        );
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenSessionService.revoke(refreshToken);
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

    public record LoginResult(LoginResponse response, String refreshToken) {
    }

    public record RefreshResult(RefreshResponse response, String refreshToken) {
    }
}
