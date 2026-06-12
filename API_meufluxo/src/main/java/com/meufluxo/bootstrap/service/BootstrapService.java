package com.meufluxo.bootstrap.service;

import com.meufluxo.auth.service.AuthService;
import com.meufluxo.category.service.CategoryService;
import com.meufluxo.workspace.service.CurrentUserService;
import com.meufluxo.workspace.service.WorkspaceSyncStateService;

import com.meufluxo.account.dto.AccountResponse;
import com.meufluxo.bootstrap.dto.BootstrapResponse;
import com.meufluxo.category.dto.CategoryResponse;
import com.meufluxo.creditcard.dto.CreditCardResponse;
import com.meufluxo.category.dto.SubCategoryResponse;
import com.meufluxo.workspace.dto.AuthenticatedUserResponse;
import com.meufluxo.account.mapper.AccountMapper;
import com.meufluxo.creditcard.mapper.CreditCardMapper;
import com.meufluxo.category.mapper.SubCategoryMapper;
import com.meufluxo.account.model.Account;
import com.meufluxo.creditcard.model.CreditCard;
import com.meufluxo.workspace.model.Workspace;
import com.meufluxo.account.repository.AccountRepository;
import com.meufluxo.category.repository.CategoryRepository;
import com.meufluxo.creditcard.repository.CreditCardRepository;
import com.meufluxo.category.repository.SubCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
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

    @Transactional(readOnly = true)
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
                workspaceSyncStateService.getResponseByWorkspaceId(wor