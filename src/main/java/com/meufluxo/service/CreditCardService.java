package com.meufluxo.service;

import com.meufluxo.dto.creditCard.CreditCardRequest;
import com.meufluxo.dto.creditCard.CreditCardResponse;
import com.meufluxo.mapper.CreditCardMapper;
import com.meufluxo.model.Account;
import com.meufluxo.model.CreditCard;
import com.meufluxo.repository.CreditCardRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

@Service
public class CreditCardService extends BaseUserService {

    private final CreditCardRepository repository;
    private final CreditCardMapper mapper;
    private final AccountService accountService;
    private final WorkspaceSyncStateService workspaceSyncStateService;

    public CreditCardService(
            CurrentUserService currentUserService,
            CreditCardRepository repository,
            CreditCardMapper mapper,
            AccountService accountService,
            WorkspaceSyncStateService workspaceSyncStateService
    ) {
        super(currentUserService);
        this.repository = repository;
        this.mapper = mapper;
        this.accountService = accountService;
        this.workspaceSyncStateService = workspaceSyncStateService;
    }

    @Transactional
    public CreditCardResponse create(CreditCardRequest request){
        CreditCard newCreditCard = mapper.toEntity(request);
        if (request.defaultPaymentAccountId() != null) {
            Account defaultPaymentAccount = accountService.findByIdOrThrow(request.defaultPaymentAccountId());
            newCreditCard.setDefaultPaymentAccount(defaultPaymentAccount);
        }
        newCreditCard.setWorkspace(getCurrentWorkspace());
        newCreditCard = repository.save(newCreditCard);
        workspaceSyncStateService.incrementCreditCardsVersion(getCurrentWorkspaceId());
        return mapper.toResponse(newCreditCard);
    }

    // When update/delete endpoints are added, increment creditCardsVersion after each successful mutation.
}
