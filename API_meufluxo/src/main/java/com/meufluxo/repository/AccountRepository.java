package com.meufluxo.repository;

import com.meufluxo.model.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByIdAndUserId(Long accountId, Long userId);

    Page<Account> findAllByUserId(Long userId, Pageable pageable);

    boolean existsByNameAndUserId(String name, Long userId);

    boolean existsByNameAndUserIdAndIdNot(String name, Long userId, Long id);

    @Query("SELECT COALESCE(SUM(a.currentBalance), 0) FROM Account a WHERE a.id IN :accountIds AND a.user.id = :userId")
    BigDecimal sumBalanceByAccountIdsAndUserId(
            @Param("accountIds") List<Long> accountIds,
            @Param("userId") Long userId
    );

    @Query("SELECT a.id FROM Account a WHERE a.user.id = :userId")
    List<Long> findAllAccountIds(@Param("userId") Long userId);
}
