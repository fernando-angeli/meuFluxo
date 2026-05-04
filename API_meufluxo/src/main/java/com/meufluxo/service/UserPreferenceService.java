package com.meufluxo.service;

import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.common.exception.NotFoundException;
import com.meufluxo.dto.user.UserPreferenceResponse;
import com.meufluxo.enums.UserLanguage;
import com.meufluxo.enums.UserTheme;
import com.meufluxo.mapper.UserPreferenceMapper;
import com.meufluxo.model.workspaceAndUsers.User;
import com.meufluxo.model.workspaceAndUsers.UserPreference;
import com.meufluxo.model.workspaceAndUsers.Workspace;
import com.meufluxo.model.workspaceAndUsers.WorkspaceUser;
import com.meufluxo.repository.UserPreferenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserPreferenceService {

    private static final UserLanguage DEFAULT_LANGUAGE = UserLanguage.PT_BR;
    private static final UserTheme DEFAULT_THEME = UserTheme.DARK;
    private static final String DEFAULT_CURRENCY = "BRL";
    private static final String DEFAULT_DATE_FORMAT = "dd/MM/yyyy";
    private static final String DEFAULT_TIMEZONE = "America/Sao_Paulo";

    private final UserPreferenceRepository userPreferenceRepository;
    private final UserPreferenceMapper userPreferenceMapper;

    public UserPreferenceService(
            UserPreferenceRepository userPreferenceRepository,
            UserPreferenceMapper userPreferenceMapper
    ) {
        this.userPreferenceRepository = userPreferenceRepository;
        this.userPreferenceMapper = userPreferenceMapper;
    }

    @Transactional
    public UserPreferenceResponse updateTheme(Long userId, UserTheme theme) {
        if (theme == null) {
            throw new BusinessException("Tema é obrigatório.");
        }

        UserPreference preference = userPreferenceRepository.findByUserIdWithActiveWorkspace(userId)
                .orElseThrow(() -> new NotFoundException("Preferências do usuário não encontradas para ID: " + userId));

        preference.setTheme(theme);
        UserPreference savedPreference = userPreferenceRepository.save(preference);
        return userPreferenceMapper.toResponse(savedPreference);
    }

    @Transactional
    public UserPreference getOrCreate(User user, List<WorkspaceUser> memberships) {
        UserPreference preference = userPreferenceRepository.findByUserIdWithActiveWorkspace(user.getId())
                .orElseGet(() -> buildDefaultPreference(user));

        if (preference.getId() == null) {
            preference.setActiveWorkspace(resolveFallbackWorkspace(memberships));
            return userPreferenceRepository.save(preference);
        }

        Workspace activeWorkspace = preference.getActiveWorkspace();
        boolean isActiveWorkspaceValid = activeWorkspace != null && memberships.stream()
                .anyMatch(membership -> membership.getWorkspace().getId().equals(activeWorkspace.getId()));

        if (!isActiveWorkspaceValid) {
            preference.setActiveWorkspace(resolveFallbackWorkspace(memberships));
            preference = userPreferenceRepository.save(preference);
        }

        return preference;
    }

    private UserPreference buildDefaultPreference(User user) {
        UserPreference preference = new UserPreference();
        preference.setUser(user);
        preference.setLanguage(DEFAULT_LANGUAGE);
        preference.setTheme(DEFAULT_THEME);
        preference.setCurrency(DEFAULT_CURRENCY);
        preference.setDateFormat(DEFAULT_DATE_FORMAT);
        preference.setTimezone(DEFAULT_TIMEZONE);
        preference.setActive(true);
        return preference;
    }

    private Workspace resolveFallbackWorkspace(List<WorkspaceUser> memberships) {
        return memberships.stream()
                .findFirst()
                .map(WorkspaceUser::getWorkspace)
                .orElse(null);
    }
}
