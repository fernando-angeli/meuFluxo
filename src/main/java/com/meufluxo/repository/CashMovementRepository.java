package com.meufluxo.repository;

import com.meufluxo.model.CashMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface CashMovementRepository extends JpaRepository<CashMovement, Long>, JpaSpecificationExecutor<CashMovement> {
    boolean existsByAccountId(Long accountId);

    boolean existsBySubCategoryCategoryIdAndWorkspaceId(Long categoryId, Long workspaceId);

    boolean existsBySubCategoryIdAndWorkspaceId(Long subCategoryId, Long workspaceId);

    Optional<CashMovement> findByIdAndWorkspaceId(Long accountId, Long workspaceId);

    Page<CashMovement> findByAccountIdAndWorkspaceId(Long accountId, Long workspaceId, Pageable pageable);

    Page<CashMovement> findBySubCategoryCategoryIdAndWorkspaceId(Long categoryId, Long workspaceId, Pageable pageable);

    Page<CashMovement> findByAccountIdAndSubCategoryCategoryIdAndWorkspaceId(Long accountId, Long categoryId, Long workspaceId, Pageable pageable);


}
