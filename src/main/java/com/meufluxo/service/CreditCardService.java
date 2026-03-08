package com.meufluxo.service;

import com.meufluxo.dto.creditCard.CreditCardRequest;
import com.meufluxo.dto.creditCard.CreditCardResponse;
import com.meufluxo.mapper.CreditCardMapper;
import com.meufluxo.model.CreditCard;
import com.meufluxo.repository.CreditCardRepository;
import org.springframework.stereotype.Service;

@Service
public class CreditCardService {

    private final CreditCardRepository repository;
    private final CreditCardMapper mapper;

    public CreditCardService(
            CreditCardRepository repository,
            CreditCardMapper mapper
    ) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public CreditCardResponse create(CreditCardRequest request){
        CreditCard newCreditCard = mapper.toEntity(request);
        newCreditCard = repository.save(newCreditCard);
        return mapper.toResponse(newCreditCard);
    }
}
