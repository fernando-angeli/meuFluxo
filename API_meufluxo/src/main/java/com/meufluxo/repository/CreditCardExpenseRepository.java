package com.meufluxo.repository;

import com.meufluxo.model.CreditCardExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface CreditCardExpenseRepository extends JpaRepository<CreditCardExpense, Long>, JpaSpecificationExecutor<CreditCardExpense> {
    Optional<CreditCardExpense> findByIdAndWorkspaceId(Long id, Long workspaceId);
    List<CreditCardExpense> findAllByInvoiceIdAndWorkspaceIdOrderByPurchaseDateDescIdDesc(Long invoiceId, Long workspaceId);

    @Query("""
            select coalesce(sum(
              case
                when e.installmentGroupId is null then e.amount
                when e.installmentNumber = 1 then (
                  select coalesce(sum(e2.amount), 0)
                  from CreditCardExpense e2
                  where e2.installmentGroupId = e.installmentGroupId
                    and e2.workspace.id = :workspaceId
                    and e2.active = true
                    and e2.status = com.meufluxo.enums.CreditCardExpenseStatus.OPEN
                )
                else 0
              end
            ), 0)
            from CreditCardExpense e
            where e.invoice.id = :invoiceId
              and e.workspace.id = :workspaceId
              and e.active = true
              and e.status = com.meufluxo.enums.CreditCardExpenseStatus.OPEN
            """)
    BigDecimal sumPurchasesStartedInInvoice(
            @Param("invoiceId") Long invoiceId,
            @Param("workspaceId") Long workspaceId
    );
}
