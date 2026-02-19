package com.meufluxo.service;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.common.exception.NotFoundException;
import com.meufluxo.dto.account.AccountRequest;
import com.meufluxo.dto.account.AccountResponse;
import com.meufluxo.dto.account.AccountUpdateRequest;
import com.meufluxo.mapper.AccountMapper;
import com.meufluxo.model.Account;
import com.meufluxo.repository.AccountRepository;
import com.meufluxo.repository.CashMovementRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AccountService {

    private final AccountRepository accountRepository;
    private final CashMovementRepository cashMovementRepository;
    private final AccountMapper accountMapper;

    public AccountService(
            AccountRepository accountRepository,
            CashMovementRepository cashMovementRepository,
            AccountMapper accountMapper)
    {
        this.accountRepository = accountRepository;
        this.cashMovementRepository = cashMovementRepository;
        this.accountMapper = accountMapper;
    }

    @Transactional(readOnly = true)
    public AccountResponse getById(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Conta não encontrada com ID: " + id));
        return accountMapper.toResponse(account);
    }

    @Transactional(readOnly = true)
    public PageResponse<AccountResponse> getAll(Pageable pageable) {
        Page<Account> categories = accountRepository.findAll(pageable);
        Page<AccountResponse> responsePage = categories.map(accountMapper::toResponse);
        return PageResponse.toPageResponse(responsePage);
    }

    public AccountResponse create(AccountRequest request) {
        if(accountRepository.existsByName(request.name())){
            throw new BusinessException("Já existe uma conta com este nome");
        }
        Account newAccount = accountMapper.toEntity(request);
        newAccount.initializeBalance();
        newAccount = accountRepository.save(newAccount);
        return accountMapper.toResponse(newAccount);
    }

    public AccountResponse update(Long id, AccountUpdateRequest request) {
        Account existingAccount = findByIdOrThrow(id);
        if(request.name() != null){
            String newName = request.name().trim();
            if(newName.isBlank())
                throw new BusinessException("Nome não pode ser vazio.");
            if(!newName.equals(existingAccount.getName()) && accountRepository.existsByNameAndIdNot(request.name(), id))
                throw new BusinessException("Já existe uma conta com este nome");
            existingAccount.setName(newName);
        }
        if(request.active() != null){
            existingAccount.setActive(request.active());
        }
        existingAccount = accountRepository.save(existingAccount);
        return accountMapper.toResponse(existingAccount);
    }

    public void delete(Long id) {
        Account account = findByIdOrThrow(id);
        if(cashMovementRepository.existsByAccountId(id)) {
            throw new BusinessException("Não é possível excluir a conta pois existem registros vinculados, só é possível inativa-la.");
        }
        accountRepository.delete(account);
    }

    @Transactional(readOnly = true)
    public Account findByIdOrThrow(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Conta não encontrada com ID: " + id));
    }

    @Transactional(readOnly = true)
    public void existsId(Long id) {
        accountRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Conta não encontrada com ID: " + id));
    }


}
