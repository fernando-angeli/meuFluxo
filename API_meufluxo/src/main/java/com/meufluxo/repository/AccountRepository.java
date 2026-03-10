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
    Optional<Account> findByIdAndWorkspaceId(Long accountId, Long workspaceId);

    Page<Account> findAllByWorkspaceId(Long workspaceId, Pageable pageable);

    boolean existsByNameAndWorkspaceId(String name, Long workspaceId);

    boolean existsByNameAndWorkspaceIdAndIdNot(String name, Long workspaceId, Long id);

    @Query("SELECT COALESCE(SUM(a.currentBalance), 0) FROM Account a WHERE a.id IN :accountIds AND a.workspace.id = :workspaceId")
    BigDecimal sumBalanceByAccountIdsAndWorkspaceId(
            @Param("accountIds") List<Long> accountIds,
            @Param("workspaceId") Long workspaceId
    );

    @Query("SELECT a.id FROM Account a WHERE a.workspace.id = :workspaceId")
    List<Long> findAllAccountIds(@Param("workspaceId") Long workspaceId);
}
