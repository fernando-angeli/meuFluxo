package com.meufluxo.service;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.common.exception.NotFoundException;
import com.meufluxo.dto.cashMovement.CashMovementRequest;
import com.meufluxo.dto.cashMovement.CashMovementResponse;
import com.meufluxo.dto.cashMovement.CashMovementUpdateRequest;
import com.meufluxo.enums.MovementType;
import com.meufluxo.enums.PaymentMethod;
import com.meufluxo.mapper.CashMovementMapper;
import com.meufluxo.model.Account;
import com.meufluxo.model.CashMovement;
import com.meufluxo.model.Category;
import com.meufluxo.repository.CashMovementRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class CashMovementService {

    private final CashMovementRepository repository;
    private final CashMovementMapper cashMovementMapper;
    private final CategoryService categoryService;
    private final AccountService accountService;

    public CashMovementService(
            CashMovementRepository repository,
            CashMovementMapper cashMovementMapper,
            CategoryService categoryService,
            AccountService accountService
    ) {
        this.repository = repository;
        this.cashMovementMapper = cashMovementMapper;
        this.categoryService = categoryService;
        this.accountService = accountService;
    }

    @Transactional(readOnly = true)
    public CashMovementResponse findById(Long id) {
        CashMovement cashMovement = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Conta não encontrada com ID: " + id));
        return cashMovementMapper.toResponse(cashMovement);
    }

    @Transactional(readOnly = true)
    public PageResponse<CashMovementResponse> findByFilters(
            Long accountId,
            Long categoryId,
            Pageable pageable
    ) {
        Optional.ofNullable(accountId).ifPresent(accountService::existsId);
        Optional.ofNullable(categoryId).ifPresent(categoryService::existsId);
        Page<CashMovement> movements;
        if(accountId != null && categoryId != null){
            movements = repository.findByAccountIdAndCategoryId(accountId, categoryId, pageable);
        } else if(accountId != null){
            movements = repository.findByAccountId(accountId, pageable);
        } else if(categoryId != null){
            movements = repository.findByCategoryId(categoryId, pageable);
        } else {
            movements = repository.findAll(pageable);
        }
        Page<CashMovementResponse> responsePage = movements.map(cashMovementMapper::toResponse);
        return PageResponse.toPageResponse(responsePage);
    }

    public CashMovementResponse create(CashMovementRequest request) {
        Category category = categoryService.findByIdOrThrow(request.categoryId());
        Account account = accountService.findByIdOrThrow(request.accountId());

        CashMovement movement = cashMovementMapper.toEntity(request);
        movement.setCategory(category);
        movement.setAccount(account);

        BigDecimal amount = request.amount();
        movement.setMovementType(
                request.movementType() != null ?
                        request.movementType() :
                        category.getMovementType()
        );
        movement.applyImpact();
        movement = repository.save(movement);
        return cashMovementMapper.toResponse(movement);
    }

    public CashMovementResponse update(
            Long id,
            CashMovementUpdateRequest request
    ) {
        CashMovement existingCashMovement = findByIdOrThrow(id);
        existingCashMovement.revertImpact();
        Category category;
        if(request.categoryId() != null){
            category = categoryService.findByIdOrThrow(request.categoryId());
            existingCashMovement.setCategory(category);
        } else {
            category = existingCashMovement.getCategory();
        }
        if(request.description() != null){
            existingCashMovement.setDescription(request.description());
        }
        if(request.amount() != null){
            BigDecimal amount = request.amount();
            existingCashMovement.setAmount(amount);
            existingCashMovement.setMovementType(
                    request.movementType() != null ?
                            request.movementType() :
                            category.getMovementType()
            );
        }
        if(request.accountId() != null){
            Account account = accountService.findByIdOrThrow(request.accountId());
            existingCashMovement.setAccount(account);
        }
        if (request.occurredAt() != null) {
            existingCashMovement.setOccurredAt(request.occurredAt());
        }
        existingCashMovement.applyImpact();
        existingCashMovement = repository.save(existingCashMovement);
        return cashMovementMapper.toResponse(existingCashMovement);
    }

    // TODO validar o delete de movimentos após fechamento de faturas por exemplo, pois
    //      pode comprometer a integridade de dados
    public void delete(Long id) {
        CashMovement cashMovement = findByIdOrThrow(id);
        repository.delete(cashMovement);
    }

    @Transactional(readOnly = true)
    public CashMovement findByIdOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movimento não encontrada com ID: " + id));
    }

}
