package com.meufluxo.mapper;

import com.meufluxo.dto.BaseResponse;
import com.meufluxo.dto.account.AccountDetailsMetaResponse;
import com.meufluxo.dto.account.AccountDetailsResponse;
import com.meufluxo.dto.account.AccountRequest;
import com.meufluxo.dto.account.AccountResponse;
import com.meufluxo.enums.AccountType;
import com.meufluxo.model.Account;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Mapper(componentModel = "spring")
public interface AccountMapper {

    @Mapping(target = "currentBalance", ignore = true)
    @Mapping(target = "balanceUpdatedAt", ignore = true)
    Account toEntity(AccountRequest accountCreateRequest);

    @Mapping(target = "meta", source = ".")
    @Mapping(target = "status", expression = "java(account != null && account.isActive())")
    @Mapping(target = "overdraftLimit", expression = "java(resolveOverdraftLimit(account))")
    @Mapping(target = "overdraftUsed", expression = "java(calculateOverdraftUsed(account))")
    @Mapping(target = "overdraftAvailable", expression = "java(calculateOverdraftAvailable(account))")
    @Mapping(target = "availableBalance", expression = "java(calculateOverdraftAvailable(account))")
    @Mapping(target = "isUsingOverdraft", expression = "java(isUsingOverdraft(account))")
    @Mapping(target = "isLimitExceeded", expression = "java(isLimitExceeded(account))")
    @Mapping(target = "overdraftUsagePercent", expression = "java(calculateOverdraftUsagePercent(account))")
    AccountResponse toResponse(Account account);

    @Mapping(
            target = "meta",
            expression = "java(toDetailsMetaResponse(account, createdByUserName, updatedByUserName))"
    )
    @Mapping(target = "status", expression = "java(account != null && account.isActive())")
    @Mapping(target = "overdraftLimit", expression = "java(resolveOverdraftLimit(account))")
    @Mapping(target = "overdraftUsed", expression = "java(calculateOverdraftUsed(account))")
    @Mapping(target = "overdraftAvailable", expression = "java(calculateOverdraftAvailable(account))")
    @Mapping(target = "availableBalance", expression = "java(calculateOverdraftAvailable(account))")
    @Mapping(target = "isUsingOverdraft", expression = "java(isUsingOverdraft(account))")
    @Mapping(target = "isLimitExceeded", expression = "java(isLimitExceeded(account))")
    @Mapping(target = "overdraftUsagePercent", expression = "java(calculateOverdraftUsagePercent(account))")
    AccountDetailsResponse toDetailsResponse(
            Account account,
            String createdByUserName,
            String updatedByUserName
    );

    BaseResponse toBaseResponse(Account account);

    default AccountType map(String value) {
        if (value == null) return null;
        try {
            return AccountType.valueOf(value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Tipo inválido para AccountType: " + value);
        }
    }

    default AccountDetailsMetaResponse toDetailsMetaResponse(
            Account account,
            String createdByUserName,
            String updatedByUserName
    ) {
        if (account == null) {
            return null;
        }

        return new AccountDetailsMetaResponse(
                account.getCreatedAt(),
                account.getUpdatedAt(),
                account.isActive(),
                account.getCreatedByUserId(),
                createdByUserName,
                account.getUpdatedByUserId(),
                updatedByUserName
        );
    }

    default BigDecimal calculateOverdraftAvailable(Account account) {
        BigDecimal available = resolveOverdraftLimit(account).subtract(calculateOverdraftUsed(account));
        if (available.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO;
        }
        return available;
    }

    default BigDecimal calculateOverdraftUsed(Account account) {
        if (account == null || account.getCurrentBalance() == null) {
            return BigDecimal.ZERO;
        }

        if (account.getCurrentBalance().compareTo(BigDecimal.ZERO) < 0) {
            return account.getCurrentBalance().abs();
        }

        return BigDecimal.ZERO;
    }

    default BigDecimal resolveOverdraftLimit(Account account) {
        if (account == null || account.getOverdraftLimit() == null) {
            return BigDecimal.ZERO;
        }
        return account.getOverdraftLimit();
    }

    default boolean isUsingOverdraft(Account account) {
        if (account == null || account.getCurrentBalance() == null) {
            return false;
        }
        return account.getCurrentBalance().compareTo(BigDecimal.ZERO) < 0;
    }

    default boolean isLimitExceeded(Account account) {
        return calculateOverdraftUsed(account).compareTo(resolveOverdraftLimit(account)) > 0;
    }

    default BigDecimal calculateOverdraftUsagePercent(Account account) {
        BigDecimal overdraftLimit = resolveOverdraftLimit(account);
        if (overdraftLimit.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        return calculateOverdraftUsed(account)
                .multiply(BigDecimal.valueOf(100))
                .divide(overdraftLimit, 2, RoundingMode.HALF_UP);
    }

}
