package com.meufluxo.mapper;

import com.meufluxo.model.Account;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AccountMapperTest {

    private final AccountMapper mapper = Mappers.getMapper(AccountMapper.class);

    @Test
    void shouldCalculateOverdraftIndicatorsWhenBalanceIsNegative() {
        Account account = new Account();
        account.setInitialBalance(BigDecimal.ZERO);
        account.setOverdraftLimit(new BigDecimal("1000.00"));
        account.initializeBalance();
        account.debit(new BigDecimal("200.00"));

        assertEquals(new BigDecimal("1000.00"), mapper.resolveOverdraftLimit(account));
        assertEquals(new BigDecimal("200.00"), mapper.calculateOverdraftUsed(account));
        assertEquals(new BigDecimal("800.00"), mapper.calculateOverdraftAvailable(account));
        assertTrue(mapper.isUsingOverdraft(account));
        assertFalse(mapper.isLimitExceeded(account));
        assertEquals(new BigDecimal("20.00"), mapper.calculateOverdraftUsagePercent(account));
    }

    @Test
    void shouldHandleNullOverdraftLimitAsZero() {
        Account account = new Account();
        account.setInitialBalance(new BigDecimal("150.00"));
        account.initializeBalance();

        assertEquals(BigDecimal.ZERO, mapper.resolveOverdraftLimit(account));
        assertEquals(BigDecimal.ZERO, mapper.calculateOverdraftUsed(account));
        assertEquals(BigDecimal.ZERO, mapper.calculateOverdraftAvailable(account));
        assertFalse(mapper.isUsingOverdraft(account));
        assertFalse(mapper.isLimitExceeded(account));
        assertEquals(BigDecimal.ZERO, mapper.calculateOverdraftUsagePercent(account));
    }

    @Test
    void shouldAllowPercentAboveHundredWhenLimitIsExceededAndKeepAvailableAtZero() {
        Account account = new Account();
        account.setInitialBalance(BigDecimal.ZERO);
        account.setOverdraftLimit(new BigDecimal("100.00"));
        account.initializeBalance();
        account.debit(new BigDecimal("250.00"));

        assertEquals(new BigDecimal("250.00"), mapper.calculateOverdraftUsed(account));
        assertEquals(BigDecimal.ZERO, mapper.calculateOverdraftAvailable(account));
        assertTrue(mapper.isUsingOverdraft(account));
        assertTrue(mapper.isLimitExceeded(account));
        assertEquals(new BigDecimal("250.00"), mapper.calculateOverdraftUsagePercent(account));
    }
}
