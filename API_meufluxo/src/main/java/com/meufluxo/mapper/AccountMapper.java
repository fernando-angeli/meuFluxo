package com.meufluxo.mapper;

import com.meufluxo.dto.BaseResponse;
import com.meufluxo.dto.account.AccountRequest;
import com.meufluxo.dto.account.AccountResponse;
import com.meufluxo.enums.AccountType;
import com.meufluxo.model.Account;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AccountMapper {

    @Mapping(target = "currentBalance", ignore = true)
    @Mapping(target = "balanceUpdatedAt", ignore = true)
    Account toEntity(AccountRequest accountCreateRequest);

    @Mapping(target = "meta", source = ".")
    AccountResponse toResponse(Account account);

    BaseResponse toBaseResponse(Account account);

    default AccountType map(String value) {
        if (value == null) return null;
        try {
            return AccountType.valueOf(value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Tipo inválido para AccountType: " + value);
        }
    }

}
