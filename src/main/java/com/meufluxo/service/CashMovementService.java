package com.meufluxo.service;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.common.exception.NotFoundException;
import com.meufluxo.config.CashMovementEventPublisher;
import com.meufluxo.dto.cashMovement.CashMovementRequest;
import com.meufluxo.dto.cashMovement.CashMovementResponse;
import com.meufluxo.dto.cashMovement.CashMovementUpdateRequest;
import com.meufluxo.enums.MovementType;
import com.meufluxo.enums.PaymentMethod;
import com.meufluxo.mapper.CashMovementMapper;
import com.meufluxo.messaging.configs.KafkaTopics;
import com.meufluxo.messaging.events.CashMovementEvent;
import com.meufluxo.messaging.mapper.CashMovementEventMapper;
import com.meufluxo.model.Account;
import com.meufluxo.model.CashMovement;
import com.meufluxo.model.Category;
import com.meufluxo.model.SubCategory;
import com.meufluxo.repository.CashMovementRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CashMovementService extends BaseUserService{

    private final CashMovementRepository repository;
    private final CashMovementMapper cashMovementMapper;
    private final CategoryService categoryService;
    private final SubCategoryService subCategoryService;
    private final AccountService accountService;
    private final AccountMovementService accountMovementService;
    // Kafka
    private final CashMovementEventPublisher eventPublisher;
    private final CashMovementEventMapper eventMapper;

    public CashMovementService(
            CurrentUserService currentUserService,
            CashMovementRepository repository,
            CashMovementMapper cashMovementMapper,
            CategoryService categoryService,
            SubCategoryService subCategoryService,
            AccountService accountService,
            AccountMovementService accountMovementService,
            CashMovementEventPublisher eventPublisher,
            CashMovementEventMapper eventMapper
    ) {
        super(currentUserService);
        this.repository = repository;
        this.cashMovementMapper = cashMovementMapper;
        this.categoryService = categoryService;
        this.subCategoryService = subCategoryService;
        this.accountService = accountService;
        this.accountMovementService = accountMovementService;
        this.eventPublisher = eventPublisher;
        this.eventMapper = eventMapper;
    }

    public CashMovementResponse findById(Long id) {
        CashMovement cashMovement = repository.findByIdAndUserId(id, getCurrentUserId())
                .orElseThrow(() -> new NotFoundException("Conta não encontrada com ID: " + id));
        return cashMovementMapper.toResponse(cashMovement);
    }

    public PageResponse<CashMovementResponse> findByFilters(
            Long accountId,
            Long categoryId,
            Long subCategoryId,
            LocalDate startDate,
            LocalDate endDate,
            PaymentMethod paymentMethod,
            MovementType movementType,
            Pageable pageable
    ) {
        Optional.ofNullable(accountId).ifPresent(accountService::existsId);
        Optional.ofNullable(categoryId).ifPresent(categoryService::existsId);
        Optional.ofNullable(subCategoryId).ifPresent(subCategoryService::existsId);
        validateDateRange(startDate, endDate);

        Long userId = getCurrentUserId();
        Specification<CashMovement> specification = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (accountId != null) {
                predicates.add(cb.equal(root.get("account").get("id"), accountId));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("subCategory").get("category").get("id"), categoryId));
            }
            if (subCategoryId != null) {
                predicates.add(cb.equal(root.get("subCategory").get("id"), subCategoryId));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("occurredAt"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("occurredAt"), endDate));
            }
            if (paymentMethod != null) {
                predicates.add(cb.equal(root.get("paymentMethod"), paymentMethod));
            }
            if (movementType != null) {
                predicates.add(cb.equal(root.get("movementType"), movementType));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<CashMovement> movements = repository.findAll(specification, pageable);
        Page<CashMovementResponse> responsePage = movements.map(cashMovementMapper::toResponse);
        return PageResponse.toPageResponse(responsePage);
    }

    @Transactional
    public CashMovementResponse create(CashMovementRequest request) {
        SubCategory subCategory = subCategoryService.findByIdOrThrow(request.subCategoryId());
        Category category = subCategory.getCategory();
        Account account = accountService.findByIdOrThrow(request.accountId());
        CashMovement movement = cashMovementMapper.toEntity(request);
        movement.setSubCategory(subCategory);
        movement.setAccount(account);
        movement.setOccurredAt(request.occurredAt());
        MovementType movementType = (
                request.movementType() != null ?
                        request.movementType() :
                        category.getMovementType()
        );
        movement.setMovementType(movementType);
        movement.setUser(getCurrentUser());
        accountMovementService.applyAccountMovement(account, request.amount(), movementType);
        movement = repository.save(movement);
        // publica evento (após salvar)
        publishEvent(KafkaTopics.CASH_MOVEMENT_CREATED, movement, "CREATED");
        return cashMovementMapper.toResponse(movement);
    }

    @Transactional
    public CashMovementResponse update(
            Long id,
            CashMovementUpdateRequest request
    ) {
        CashMovement existingCashMovement = findByIdOrThrow(id);
        // snapshot do estado antigo (pra reverter)
        Account oldAccount = existingCashMovement.getAccount();
        SubCategory oldSubCategory = existingCashMovement.getSubCategory();
        BigDecimal oldAmount = existingCashMovement.getAmount();
        MovementType oldType = existingCashMovement.getMovementType();

        // calcula novos valores (se não veio, mantém)
        SubCategory newSubCategory = (request.subCategoryId() != null)
                ? subCategoryService.findByIdOrThrow(request.subCategoryId())
                : oldSubCategory;

        Account newAccount = (request.accountId() != null)
                ? accountService.findByIdOrThrow(request.accountId())
                : oldAccount;

        BigDecimal newAmount = (request.amount() != null) ? request.amount() : oldAmount;

        MovementType newType;
        if(request.movementType() != null){
            newType = request.movementType();
        } else if (request.subCategoryId() != null){
            newType = newSubCategory.getCategory().getMovementType();
        } else {
            newType = oldType;
        }

        // Reverter movimento anterior
        accountMovementService.revertAccountMovement(oldAccount, oldAmount, oldType);
        // Aplicar movimento novo
        accountMovementService.applyAccountMovement(newAccount, newAmount, newType);

        if (request.description() != null) existingCashMovement.setDescription(request.description());
        if (request.occurredAt() != null) existingCashMovement.setOccurredAt(request.occurredAt());

        existingCashMovement.setSubCategory(newSubCategory);
        existingCashMovement.setAccount(newAccount);
        existingCashMovement.setAmount(newAmount);
        existingCashMovement.setMovementType(newType);
        existingCashMovement = repository.save(existingCashMovement);

        publishEvent(KafkaTopics.CASH_MOVEMENT_UPDATED, existingCashMovement, "UPDATED");
        return cashMovementMapper.toResponse(existingCashMovement);
    }

    // TODO validar o delete de movimentos após fechamento de faturas por exemplo, pois
    //      pode comprometer a integridade de dados
    @Transactional
    public void delete(Long id) {
        CashMovement cashMovement = findByIdOrThrow(id);

        accountMovementService.revertAccountMovement(
                cashMovement.getAccount(),
                cashMovement.getAmount(),
                cashMovement.getMovementType()
        );
        repository.delete(cashMovement);
        publishEvent(KafkaTopics.CASH_MOVEMENT_DELETED, cashMovement, "DELETED");
    }

    public CashMovement findByIdOrThrow(Long id) {
        return repository.findByIdAndUserId(id, getCurrentUserId())
                .orElseThrow(() -> new NotFoundException("Movimento não encontrada com ID: " + id));
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("startDate must be before or equal to endDate.");
        }
    }

    private void publishEvent(String topic, CashMovement movement, String eventType) {
        CashMovementEvent base = eventMapper.toEvent(movement);

        CashMovementEvent event = new CashMovementEvent(
                UUID.randomUUID().toString(),
                eventType,
                LocalDateTime.now(),

                base.movementId(),
                base.accountId(),
                base.categoryId(),
                base.amount(),
                base.movementType(),
                base.movementDate()
        );

        // key: accountId ajuda a manter ordenação por conta
        String key = movement.getAccount() != null ? movement.getAccount().getId().toString() : movement.getId().toString();
        eventPublisher.publish(topic, key, event);
    }

}
