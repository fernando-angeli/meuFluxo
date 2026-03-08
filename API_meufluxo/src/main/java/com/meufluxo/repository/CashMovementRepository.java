package com.meufluxo.repository;

import com.meufluxo.model.CashMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface CashMovementRepository extends JpaRepository<CashMovement, Long>, JpaSpecificationExecutor<CashMovement> {
    boolean existsByAccountId(Long accountId);

    boolean existsBySubCategoryCategoryIdAndUserId(Long categoryId, Long userId);

    boolean existsBySubCategoryIdAndUserId(Long subCategoryId, Long userId);

    Optional<CashMovement> findByIdAndUserId(Long accountId, Long userId);

    Page<CashMovement> findByAccountIdAndUserId(Long accountId, Long userId, Pageable pageable);

    Page<CashMovement> findBySubCategoryCategoryIdAndUserId(Long categoryId, Long userId, Pageable pageable);

    Page<CashMovement> findByAccountIdAndSubCategoryCategoryIdAndUserId(Long accountId, Long categoryId, Long userId, Pageable pageable);


}
