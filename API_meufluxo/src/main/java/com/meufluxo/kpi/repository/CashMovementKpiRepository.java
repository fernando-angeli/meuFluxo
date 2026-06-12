package com.meufluxo.kpi.repository;

import com.meufluxo.cashmovement.model.MovementType;

import com.meufluxo.kpi.dto.CategoryKpiResponse;
import com.meufluxo.kpi.dto.SubCategoryKpiResponse;
import com.meufluxo.cashmovement.model.CashMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface CashMovementKpiRepository extends JpaRepository<CashMovement, Long> {

    @Query("""
        SELECT COALESCE(SUM(cm.amount), 0)
        FROM CashMovement cm
        WHERE cm.movementType = com.meufluxo.cashmovement.model.MovementType.INCOME
          AND cm.occurredAt BETWEEN :startDate AND :endDate
          AND cm.account.id IN :accountIds
          AND (:categoryIds IS NULL OR cm.subCategory.category.id IN :categoryIds)
    """)
    BigDecimal sumIncome(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("accountIds") List<Long> accountIds,
            @Param("categoryIds") List<Long> categoryIds
    );

    @Query("""
        SELECT COALESCE(SUM(cm.amount), 0)
        FROM CashMovement cm
        WHERE cm.movementType = com.meufluxo.cashmovement.model.MovementType.EXPENSE
          AND cm.occurredAt BETWEEN :startDate AND :endDate
          AND cm.account.id IN :accountIds
          AND (:categoryIds IS NULL OR cm.subCategory.category.id IN :categoryIds)
    """)
    BigDecimal sumExpense(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("accountIds") List<Long> accountIds,
            @Param("categoryIds") List<Long> categoryIds
    );

    @Query("""
        SELECT new com.meufluxo.kpi.dto.CategoryKpiResponse(
            cm.subCategory.category.id,
            cm.subCategory.category.name,
            COALESCE(SUM(cm.amount), 0),
            0
        )
        FROM CashMovement cm
        WHERE cm.movementType = com.meufluxo.cashmovement.model.MovementType.EXPENSE
          AND cm.occurredAt BETWEEN :startDate AND :endDate
          AND cm.account.id IN :accountIds
          AND (:categoryIds IS NULL OR cm.subCategory.category.id IN :categoryIds)
        GROUP BY cm.subCategory.category.id, cm.subCategory.category.name
        ORDER BY SUM(cm.amount) DESC
    """)
    List<CategoryKpiResponse> findExpensesByCategory(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("accountIds") List<Long> accountIds,
            @Param("categoryIds") List<Long> categoryIds
    );

    @Query("""
        SELECT new com.meufluxo.kpi.dto.SubCategoryKpiResponse(
            cm.subCategory.category.id,
            cm.subCategory.category.name,
            cm.subCategory.id,
            cm.subCategory.name,
            COALESCE(SUM(cm.amount), 0),
            0
        )
        FROM CashMovement cm
        WHERE cm.movementType = com.meufluxo.cashmovement.model.MovementType.EXPENSE
          AND cm.occurredAt BETWEEN :startDate AND :endDate
          AND cm.account.id IN :accountIds
          AND (:categoryIds IS NULL OR cm.subCategory.category.id IN :categoryIds)
        GROUP BY cm.subCategory.category.id, cm.subCategory.category.name, cm.subCategory.id, cm.subCategory.name
        ORDER BY cm.subCategory.category.name ASC, SUM(cm.amount) DESC
    """)
    List<SubCategoryKpiResponse> findExpensesBySubCategory(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("accountIds") List<Long> accountIds,
            @Param("categoryIds") List<Long> categoryIds
    );
}
