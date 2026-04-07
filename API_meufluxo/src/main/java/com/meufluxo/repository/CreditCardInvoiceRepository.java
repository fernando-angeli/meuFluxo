package com.meufluxo.repository;

import com.meufluxo.model.CreditCardInvoice;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface CreditCardInvoiceRepository extends JpaRepository<CreditCardInvoice, Long>, JpaSpecificationExecutor<CreditCardInvoice> {
    Optional<CreditCardInvoice> findByIdAndCreditCardWorkspaceId(Long id, Long workspaceId);

    Optional<CreditCardInvoice> findByCreditCardIdAndReferenceYearAndReferenceMonth(
            Long creditCardId,
            Integer referenceYear,
            Integer referenceMonth
    );

    @Query("""
            select coalesce(sum(e.amount), 0)
            from CreditCardExpense e
            where e.invoice.id = :invoiceId
              and e.active = true
              and e.status = com.meufluxo.enums.CreditCardExpenseStatus.OPEN
            """)
    BigDecimal sumOpenExpensesByInvoiceId(@Param("invoiceId") Long invoiceId);

    Optional<CreditCardInvoice> findByCreditCardIdAndReferenceYearAndReferenceMonthAndCreditCardWorkspaceId(
            Long creditCardId,
            Integer referenceYear,
            Integer referenceMonth,
            Long workspaceId
    );
}
