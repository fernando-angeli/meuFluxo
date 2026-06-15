package com.meufluxo.account.service;

import com.meufluxo.shared.dto.PageResponse;
import com.meufluxo.shared.exception.BusinessException;
import com.meufluxo.shared.exception.NotFoundException;
import com.meufluxo.account.dto.AccountRequest;
import com.meufluxo.account.dto.AccountResponse;
import com.meufluxo.account.dto.AccountUpdateRequest;
import com.meufluxo.cashmovement.model.MovementType;
import com.meufluxo.account.mapper.AccountMapper;
import com.meufluxo.account.model.Account;
import com.meufluxo.account.repository.AccountRepository;
import com.meufluxo.cashmovement.repository.CashMovementRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Objects;

@Service
@Transactional
public class AccountMovementService {

    private final AccountRepository accountRepository;
    private final CashMovementRepository cashMovementRepository;
    private final AccountMapper accountMapper;

    public AccountMovementService(
            AccountRepository accountRepository,
            CashMovementRepository cashMovementRepository,
            AccountMapper accountMapper
    ) {
        this.accountRepository = accountRepository;
        this.cashMovementRepository = cashMovementRepository;
        this.accountMapper = accountMapper;
    }

    public void applyAccountMovement(Account account, BigDecimal amount, MovementType movementType) {
        validate(account, amount, movementType);
        if (movementType == MovementType.EXPENSE) {
            account.debit(amount.abs());
            return;
        }
        // INCOME (ou equivalente) credita o valor absoluto (evita "credit(-10)")
        account.credit(amount.abs());
    }

    public void revertAccountMovement(Account account, BigDecimal amount, MovementType movementType) {
        validate(account, amount, movementType);
        // Reverter EXPENSE => creditar o valor que foi debitado
        if (movementType == MovementType.EXPENSE) {
            account.credit(amount.abs());
            return;
        }
        // Reverter INCOME => debitar o valor que foi creditado
        account.debit(amount.abs());
    }

    private void validate(Account account, BigDecimal amount, MovementType movementType) {
        Objects.requireNonNull(account, "account must not be null");
        Objects.requireNonNull(amount, "amount must not be null");
        Objects.requireNonNull(movementType, "movementType must not be null");

        if (amount.compareTo(BigDecimal.ZERO) == 0) {
            throw new IllegalArgumentException("amount must not be zero");
        }
    }
}