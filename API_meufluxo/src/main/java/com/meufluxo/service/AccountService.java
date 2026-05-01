package com.meufluxo.service;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.common.exception.NotFoundException;
import com.meufluxo.dto.account.AccountDetailsResponse;
import com.meufluxo.dto.account.AccountRequest;
import com.meufluxo.dto.account.AccountResponse;
import com.meufluxo.dto.account.AccountUpdateRequest;
import com.meufluxo.mapper.AccountMapper;
import com.meufluxo.model.Account;
import com.meufluxo.model.workspaceAndUsers.User;
import com.meufluxo.repository.AccountRepository;
import com.meufluxo.repository.CashMovementRepository;
import com.meufluxo.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
public class AccountService extends BaseUserService{

    private final AccountRepository accountRepository;
    private final CashMovementRepository cashMovementRepository;
    private final UserRepository userRepository;
    private final AccountMapper accountMapper;
    private final WorkspaceSyncStateService workspaceSyncStateService;

    public AccountService(
            CurrentUserService currentUserService,
            AccountRepository accountRepository,
            CashMovementRepository cashMovementRepository,
            UserRepository userRepository,
            AccountMapper accountMapper,
            WorkspaceSyncStateService workspaceSyncStateService
    ) {
        super(currentUserService);
        this.accountRepository = accountRepository;
        this.cashMovementRepository = cashMovementRepository;
        this.userRepository = userRepository;
        this.accountMapper = accountMapper;
        this.workspaceSyncStateService = workspaceSyncStateService;
    }

    public AccountDetailsResponse getById(Long id) {
        Account account = accountRepository.findByIdAndWorkspaceId(id, getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("Conta não encontrada com ID: " + id));
        Map<Long, String> namesByUserId = resolveAuditUserNames(account);
        return accountMapper.toDetailsResponse(
                account,
                namesByUserId.get(account.getCreatedByUserId()),
                namesByUserId.get(account.getUpdatedByUserId())
        );
    }

    public PageResponse<AccountResponse> getAll(Pageable pageable) {
        Page<Account> categories = accountRepository.findAllByWorkspaceId(getCurrentWorkspaceId(), pageable);
        Page<AccountResponse> responsePage = categories.map(accountMapper::toResponse);
        return PageResponse.toPageResponse(responsePage);
    }

    @Transactional
    public AccountResponse create(AccountRequest request) {
        if (accountRepository.existsByNameAndWorkspaceId(request.name(), getCurrentWorkspaceId())) {
            throw new BusinessException("Já existe uma conta com este nome.");
        }
        Account newAccount = accountMapper.toEntity(request);
        applyBankingData(
                newAccount,
                request.bankCode(),
                request.bankName(),
                request.agency(),
                request.accountNumber(),
                request.overdraftLimit()
        );
        newAccount.initializeBalance();
        newAccount.setWorkspace(getCurrentWorkspace());
        newAccount = accountRepository.save(newAccount);
        workspaceSyncStateService.incrementAccountsVersion(getCurrentWorkspaceId());
        return accountMapper.toResponse(newAccount);
    }

    @Transactional
    public AccountResponse update(
            Long id,
            AccountUpdateRequest request
    ) {
        Account existingAccount = findByIdOrThrow(id);
        if (request.name() != null) {
            String newName = request.name().trim();
            if (newName.isBlank())
                throw new BusinessException("Nome não pode ser vazio.");
            if (!newName.equals(existingAccount.getName()) && accountRepository.existsByNameAndWorkspaceIdAndIdNot(request.name(), getCurrentWorkspaceId(), id))
                throw new BusinessException("Já existe uma conta com este nome");
            existingAccount.setName(newName);
        }
        if (request.active() != null) {
            existingAccount.setActive(request.active());
        }
        if (request.bankCode() != null) {
            existingAccount.setBankCode(request.bankCode());
        }
        if (request.bankName() != null) {
            existingAccount.setBankName(normalizeText(request.bankName()));
        }
        if (request.agency() != null) {
            existingAccount.setAgency(normalizeText(request.agency()));
        }
        if (request.accountNumber() != null) {
            existingAccount.setAccountNumber(normalizeText(request.accountNumber()));
        }
        if (request.overdraftLimit() != null) {
            existingAccount.setOverdraftLimit(request.overdraftLimit());
        }
        if (request.initialBalanceDate() != null) {
            existingAccount.setInitialBalanceDate(request.initialBalanceDate());
        }
        existingAccount = accountRepository.save(existingAccount);
        workspaceSyncStateService.incrementAccountsVersion(getCurrentWorkspaceId());
        return accountMapper.toResponse(existingAccount);
    }

    @Transactional
    public void delete(Long id) {
        Account account = findByIdOrThrow(id);
        if (cashMovementRepository.existsByAccountId(id)) {
            throw new BusinessException("Não é possível excluir a conta pois existem registros vinculados, só é possível inativa-la.");
        }
        accountRepository.delete(account);
        workspaceSyncStateService.incrementAccountsVersion(getCurrentWorkspaceId());
    }

    public Account findByIdOrThrow(Long id) {
        return accountRepository.findByIdAndWorkspaceId(id, getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("Conta não encontrada com ID: " + id));
    }

    public void existsId(Long id) {
        accountRepository.findByIdAndWorkspaceId(id, getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("Conta não encontrada com ID: " + id));
    }

    private Map<Long, String> resolveAuditUserNames(Account account) {
        Set<Long> userIds = new HashSet<>();
        if (account.getCreatedByUserId() != null) {
            userIds.add(account.getCreatedByUserId());
        }
        if (account.getUpdatedByUserId() != null) {
            userIds.add(account.getUpdatedByUserId());
        }

        if (userIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, String> namesByUserId = new HashMap<>();
        for (User user : userRepository.findAllById(userIds)) {
            namesByUserId.put(user.getId(), user.getName());
        }
        return namesByUserId;
    }

    private void applyBankingData(
            Account account,
            Integer bankCode,
            String bankName,
            String agency,
            String accountNumber,
            BigDecimal overdraftLimit
    ) {
        account.setBankCode(bankCode);
        account.setBankName(normalizeText(bankName));
        account.setAgency(normalizeText(agency));
        account.setAccountNumber(normalizeText(accountNumber));
        account.setOverdraftLimit(overdraftLimit);
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

}
