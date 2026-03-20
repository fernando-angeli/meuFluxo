package com.meufluxo.service;

import com.meufluxo.dto.account.AccountResponse;
import com.meufluxo.dto.category.CategoryResponse;
import com.meufluxo.dto.creditCard.CreditCardResponse;
import com.meufluxo.dto.subCategory.SubCategoryResponse;
import com.meufluxo.dto.user.AuthenticatedSessionResponse;
import com.meufluxo.dto.user.UserPreferenceResponse;
import com.meufluxo.dto.user.UserWorkspaceResponse;
import com.meufluxo.dto.user.WorkspaceSummaryResponse;
import com.meufluxo.dto.workspace.WorkspaceSyncStateResponse;
import com.meufluxo.mapper.AccountMapper;
import com.meufluxo.mapper.CategoryMapper;
import com.meufluxo.mapper.CreditCardMapper;
import com.meufluxo.mapper.SubCategoryMapper;
import com.meufluxo.model.workspaceAndUsers.User;
import com.meufluxo.model.workspaceAndUsers.UserPreference;
import com.meufluxo.model.workspaceAndUsers.Workspace;
import com.meufluxo.model.workspaceAndUsers.WorkspaceUser;
import com.meufluxo.repository.AccountRepository;
import com.meufluxo.repository.CategoryRepository;
import com.meufluxo.repository.CreditCardRepository;
import com.meufluxo.repository.SubCategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthenticatedSessionService {

    private static final Logger log = LoggerFactory.getLogger(AuthenticatedSessionService.class);

    private final CurrentUserService currentUserService;
    private final UserWorkspaceService userWorkspaceService;
    private final UserPreferenceService userPreferenceService;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final AccountRepository accountRepository;
    private final CreditCardRepository creditCardRepository;
    private final CategoryMapper categoryMapper;
    private final SubCategoryMapper subCategoryMapper;
    private final AccountMapper accountMapper;
    private final CreditCardMapper creditCardMapper;
    private final WorkspaceSyncStateService workspaceSyncStateService;

    public AuthenticatedSessionService(
            CurrentUserService currentUserService,
            UserWorkspaceService userWorkspaceService,
            UserPreferenceService userPreferenceService,
            CategoryRepository categoryRepository,
            SubCategoryRepository subCategoryRepository,
            AccountRepository accountRepository,
            CreditCardRepository creditCardRepository,
            CategoryMapper categoryMapper,
            SubCategoryMapper subCategoryMapper,
            AccountMapper accountMapper,
            CreditCardMapper creditCardMapper,
            WorkspaceSyncStateService workspaceSyncStateService
    ) {
        this.currentUserService = currentUserService;
        this.userWorkspaceService = userWorkspaceService;
        this.userPreferenceService = userPreferenceService;
        this.categoryRepository = categoryRepository;
        this.subCategoryRepository = subCategoryRepository;
        this.accountRepository = accountRepository;
        this.creditCardRepository = creditCardRepository;
        this.categoryMapper = categoryMapper;
        this.subCategoryMapper = subCategoryMapper;
        this.accountMapper = accountMapper;
        this.creditCardMapper = creditCardMapper;
        this.workspaceSyncStateService = workspaceSyncStateService;
    }

    public AuthenticatedSessionResponse getAuthenticatedSession() {
        User user = currentUserService.getCurrentUser();
        List<WorkspaceUser> memberships = userWorkspaceService.getActiveMemberships(user.getId());
        UserPreference preference = userPreferenceService.getOrCreate(user, memberships);
        Workspace activeWorkspace = preference.getActiveWorkspace();

        return new AuthenticatedSessionResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                toPreferenceResponse(preference),
                toWorkspaceSummary(activeWorkspace),
                toWorkspaceResponses(memberships),
                getCategories(activeWorkspace),
                getSubCategories(activeWorkspace),
                getAccounts(activeWorkspace),
                getCreditCards(activeWorkspace),
                safeGetSyncState(activeWorkspace)
        );
    }

    private UserPreferenceResponse toPreferenceResponse(UserPreference preference) {
        return new UserPreferenceResponse(
                preference.getLanguage(),
                preference.getTheme(),
                preference.getCurrency(),
                preference.getDateFormat(),
                preference.getTimezone()
        );
    }

    private WorkspaceSummaryResponse toWorkspaceSummary(Workspace workspace) {
        if (workspace == null) {
            return null;
        }

        return new WorkspaceSummaryResponse(workspace.getId(), workspace.getName());
    }

    private List<UserWorkspaceResponse> toWorkspaceResponses(List<WorkspaceUser> memberships) {
        return memberships.stream()
                .map(membership -> new UserWorkspaceResponse(
                        membership.getWorkspace().getId(),
                        membership.getWorkspace().getName(),
                        membership.getRole()
                ))
                .toList();
    }

    private List<CategoryResponse> getCategories(Workspace activeWorkspace) {
        if (activeWorkspace == null) {
            return List.of();
        }

        return categoryRepository.findAllByWorkspaceIdOrderByIdAsc(activeWorkspace.getId()).stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    private List<SubCategoryResponse> getSubCategories(Workspace activeWorkspace) {
        if (activeWorkspace == null) {
            return List.of();
        }

        return subCategoryRepository.findAllByWorkspaceIdOrderByIdAsc(activeWorkspace.getId()).stream()
                .map(subCategoryMapper::toResponse)
                .toList();
    }

    private List<AccountResponse> getAccounts(Workspace activeWorkspace) {
        if (activeWorkspace == null) {
            return List.of();
        }

        return accountRepository.findAllByWorkspaceIdOrderByIdAsc(activeWorkspace.getId()).stream()
                .map(accountMapper::toResponse)
                .toList();
    }

    private List<CreditCardResponse> getCreditCards(Workspace activeWorkspace) {
        if (activeWorkspace == null) {
            return List.of();
        }

        return creditCardRepository.findAllByWorkspaceIdOrderByIdAsc(activeWorkspace.getId()).stream()
                .map(creditCardMapper::toResponse)
                .toList();
    }

    private WorkspaceSyncStateResponse safeGetSyncState(Workspace activeWorkspace) {
        if (activeWorkspace == null) {
            return null;
        }

        try {
            return workspaceSyncStateService.getResponseByWorkspaceId(activeWorkspace.getId());
        } catch (RuntimeException exception) {
            log.warn("Failed to resolve workspace sync state for workspaceId={}. Returning default sync state.", activeWorkspace.getId(), exception);
            return new WorkspaceSyncStateResponse(
                    activeWorkspace.getId(),
                    1L,
                    1L,
                    1L,
                    1L,
                    LocalDateTime.now()
            );
        }
    }
}
