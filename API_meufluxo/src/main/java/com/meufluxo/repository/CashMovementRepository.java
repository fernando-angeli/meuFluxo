package com.meufluxo.repository;

import com.meufluxo.model.CashMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CashMovementRepository extends JpaRepository <CashMovement, Long> {

    Page<CashMovement> findByAccountId(Long accountId, Pageable pageable);
    boolean existsByAccountId(Long accountId);

    Page<CashMovement> findByCategoryId(Long categoryId, Pageable pageable);
    boolean existsByCategoryId(Long categoryId);

    Page<CashMovement> findByAccountIdAndCategoryId(Long accountId, Long categoryId, Pageable pageable);
}
