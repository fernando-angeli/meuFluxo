package com.meufluxo.service;

import com.meufluxo.dto.account.AccountResponse;
import com.meufluxo.dto.bootstrap.BootstrapResponse;
import com.meufluxo.dto.category.CategoryResponse;
import com.meufluxo.dto.creditCard.CreditCardResponse;
import com.meufluxo.dto.subCategory.SubCategoryResponse;
import com.meufluxo.dto.user.AuthenticatedUserResponse;
import com.meufluxo.mapper.AccountMapper;
import com.meufluxo.mapper.CreditCardMapper;
import com.meufluxo.mapper.SubCategoryMapper;
import com.meufluxo.model.Account;
import com.meufluxo.model.CreditCard;
import com.meufluxo.model.workspaceAndUsers.Workspace;
import com.meufluxo.repository.AccountRepository;
import com.meufluxo.repository.CategoryRepository;
import com.meufluxo.repository.CreditCardRepository;
import com.meufluxo.repository.SubCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BootstrapService {

    private final AuthService authService;
    private final CurrentUserService currentUserService;
    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;
    private final SubCategoryRepository subCategoryRepository;
    private final AccountRepository accountRepository;
    private final CreditCardRepository creditCardRepository;
    private final SubCategoryMapper subCategoryMapper;
    private final AccountMapper accountMapper;
    private final CreditCardMapper creditCardMapper;
    private final WorkspaceSyncStateService workspaceSyncStateService;

    public BootstrapService(
            AuthService authService,
            CurrentUserService currentUserService,
            CategoryRepository categoryRepository,
            CategoryService categoryService,
            SubCategoryRepository subCategoryRepository,
            AccountRepository accountRepository,
            CreditCardRepository creditCardRepository,
            SubCategoryMapper subCategoryMapper,
            AccountMapper accountMapper,
            CreditCardMapper creditCardMapper,
            WorkspaceSyncStateService workspaceSyncStateService
    ) {
        this.authService = authService;
        this.currentUserService = currentUserService;
        this.categoryRepository = categoryRepository;
        this.categoryService = categoryService;
        this.subCategoryRepository = subCategoryRepository;
        this.accountRepository = accountRepository;
        this.creditCardRepository = creditCardRepository;
        this.subCategoryMapper = subCategoryMapper;
        this.accountMapper = accountMapper;
        this.creditCardMapper = creditCardMapper;
        this.workspaceSyncStateService = workspaceSyncStateService;
    }

    @Transactional
    public BootstrapResponse getBootstrap() {
        AuthenticatedUserResponse authenticatedUser = authService.getAuthenticatedUser();
        Workspace workspace = currentUserService.getCurrentWorkspace();
        Long workspaceId = workspace.getId();

        List<CategoryResponse> categories = categoryRepository.findAllByWorkspaceIdOrderByIdAsc(workspaceId).stream()
                .map(categoryService::toResponseWithSubCategoryCount)
                .toList();
        List<SubCategoryResponse> subCategories = subCategoryRepository.findAllByWorkspaceIdOrderByIdAsc(workspaceId).stream()
                .map(subCategoryMapper::toResponse)
                .toList();
        List<AccountResponse> accounts = accountRepository.findAllByWorkspaceIdOrderByIdAsc(workspaceId).stream()
                .map(accountMapper::toResponse)
                .toList();
        List<CreditCardResponse> creditCards = creditCardRepository.findAllByWorkspaceIdOrderByIdAsc(workspaceId).stream()
                .map(creditCardMapper::toResponse)
                .toList();

        return new BootstrapResponse(
                authenticatedUser.preferences(),
                authenticatedUser.activeWorkspace(),
                authenticatedUser.workspaces(),
                categories,
                subCategories,
                accounts,
                creditCards,
                workspaceSyncStateService.getResponseByWorkspaceId(workspaceId)
        );
    }
}
