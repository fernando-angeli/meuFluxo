package com.meufluxo.service;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.common.exception.NotFoundException;
import com.meufluxo.dto.creditCard.CreditCardRequest;
import com.meufluxo.dto.creditCard.CreditCardResponse;
import com.meufluxo.dto.creditCard.CreditCardUpdateRequest;
import com.meufluxo.mapper.CreditCardMapper;
import com.meufluxo.model.Account;
import com.meufluxo.model.CreditCard;
import com.meufluxo.repository.CreditCardRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CreditCardService extends BaseUserService {

    private final CreditCardRepository creditCardRepository;
    private final CreditCardMapper creditCardMapper;
    private final AccountService accountService;
    private final WorkspaceSyncStateService workspaceSyncStateService;

    public CreditCardService(
            CurrentUserService currentUserService,
            CreditCardRepository creditCardRepository,
            CreditCardMapper creditCardMapper,
            AccountService accountService,
            WorkspaceSyncStateService workspaceSyncStateService
    ) {
        super(currentUserService);
        this.creditCardRepository = creditCardRepository;
        this.creditCardMapper = creditCardMapper;
        this.accountService = accountService;
        this.workspaceSyncStateService = workspaceSyncStateService;
    }

    public CreditCardResponse getById(Long id) {
        CreditCard creditCard = findByIdOrThrow(id);
        return creditCardMapper.toResponse(creditCard);
    }

    public PageResponse<CreditCardResponse> getAll(Boolean active, Pageable pageable) {
        Page<CreditCard> creditCards = active == null
                ? creditCardRepository.findAllByWorkspaceId(getCurrentWorkspaceId(), pageable)
                : creditCardRepository.findAllByWorkspaceIdAndActive(getCurrentWorkspaceId(), active, pageable);
        Page<CreditCardResponse> responsePage = creditCards.map(creditCardMapper::toResponse);
        return PageResponse.toPageResponse(responsePage);
    }

    @Transactional
    public CreditCardResponse create(CreditCardRequest request) {
        validateNameUniqueness(request.name(), null);

        CreditCard newCreditCard = creditCardMapper.toEntity(request);
        newCreditCard.setName(request.name().trim());
        newCreditCard.setNotes(trimToNull(request.notes()));
        newCreditCard.setDefaultPaymentAccount(resolveAccount(request.defaultPaymentAccountId()));
        newCreditCard.setWorkspace(getCurrentWorkspace());

        CreditCard saved = creditCardRepository.save(newCreditCard);
        if (!request.active()) {
            saved.setActive(false);
            saved = creditCardRepository.save(saved);
        }
        workspaceSyncStateService.incrementCreditCardsVersion(getCurrentWorkspaceId());
        return creditCardMapper.toResponse(saved);
    }

    @Transactional
    public CreditCardResponse update(Long id, CreditCardUpdateRequest request) {
        CreditCard existing = findByIdOrThrow(id);
        validateNameUniqueness(request.name(), id);

        existing.setName(request.name().trim());
        existing.setBrand(request.brand());
        existing.setClosingDay(request.closingDay());
        existing.setDueDay(request.dueDay());
        existing.setCreditLimit(request.creditLimit());
        existing.setDefaultPaymentAccount(resolveAccount(request.defaultPaymentAccountId()));
        existing.setNotes(trimToNull(request.notes()));
        existing.setActive(request.active());

        CreditCard saved = creditCardRepository.save(existing);
        workspaceSyncStateService.incrementCreditCardsVersion(getCurrentWorkspaceId());
        return creditCardMapper.toResponse(saved);
    }

    @Transactional
    public CreditCardResponse updateActive(Long id, boolean active) {
        CreditCard existing = findByIdOrThrow(id);
        existing.setActive(active);
        CreditCard saved = creditCardRepository.save(existing);
        workspaceSyncStateService.incrementCreditCardsVersion(getCurrentWorkspaceId());
        return creditCardMapper.toResponse(saved);
    }

    public CreditCard findByIdOrThrow(Long id) {
        return creditCardRepository.findByIdAndWorkspaceId(id, getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("Cartão de crédito não encontrado com ID: " + id));
    }

    private void validateNameUniqueness(String name, Long currentId) {
        String normalizedName = name.trim();
        boolean exists = currentId == null
                ? creditCardRepository.existsByNameAndWorkspaceId(normalizedName, getCurrentWorkspaceId())
                : creditCardRepository.existsByNameAndWorkspaceIdAndIdNot(normalizedName, getCurrentWorkspaceId(), currentId);
        if (exists) {
            throw new BusinessException("Já existe um cartão de crédito com este nome.");
        }
    }

    private Account resolveAccount(Long accountId) {
        if (accountId == null) {
            return null;
        }
        return accountService.findByIdOrThrow(accountId);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
