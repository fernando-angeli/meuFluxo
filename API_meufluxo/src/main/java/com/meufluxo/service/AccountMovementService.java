package com.meufluxo.service;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.common.exception.NotFoundException;
import com.meufluxo.dto.account.AccountRequest;
import com.meufluxo.dto.account.AccountResponse;
import com.meufluxo.dto.account.AccountUpdateRequest;
import com.meufluxo.enums.MovementType;
import com.meufluxo.mapper.AccountMapper;
import com.meufluxo.model.Account;
import com.meufluxo.repository.AccountRepository;
import com.meufluxo.repository.CashMovementRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Objects;

@Service
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

    public void revertAccountMovement(Account account, BigDecimal amount, MovementType movementType){
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
