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

    @Query(
            value = """
                    select cci.*
                    from credit_card_invoices cci
                    where cci.credit_card_id = :creditCardId
                      and cci.reference_year = :referenceYear
                      and cast(cci.reference_month as text) = cast(:referenceMonth as text)
                    limit 1
                    """,
            nativeQuery = true
    )
    Optional<CreditCardInvoice> findByCreditCardIdAndReferenceYearAndReferenceMonth(
            @Param("creditCardId") Long creditCardId,
            @Param("referenceYear") Integer referenceYear,
            @Param("referenceMonth") Integer referenceMonth
    );

    @Query("""
            select coalesce(sum(e.amount), 0)
            from CreditCardExpense e
            where e.invoice.id = :invoiceId
              and e.active = true
              and e.status = com.meufluxo.enums.CreditCardExpenseStatus.OPEN
            """)
    BigDecimal sumOpenExpensesByInvoiceId(@Param("invoiceId") Long invoiceId);

    @Query(
            value = """
                    select cci.*
                    from credit_card_invoices cci
                    join credit_cards cc on cc.id = cci.credit_card_id
                    where cc.id = :creditCardId
                      and cci.reference_year = :referenceYear
                      and cast(cci.reference_month as text) = cast(:referenceMonth as text)
                      and cc.workspace_id = :workspaceId
                    limit 1
                    """,
            nativeQuery = true
    )
    Optional<CreditCardInvoice> findByCreditCardIdAndReferenceYearAndReferenceMonthAndCreditCardWorkspaceId(
            @Param("creditCardId") Long creditCardId,
            @Param("referenceYear") Integer referenceYear,
            @Param("referenceMonth") Integer referenceMonth,
            @Param("workspaceId") Long workspaceId
    );

    @Query("""
            select coalesce(sum(i.remainingAmount), 0)
            from CreditCardInvoice i
            where i.creditCard.id = :creditCardId
              and i.creditCard.workspace.id = :workspaceId
              and i.active = true
              and i.status <> com.meufluxo.enums.CreditCardInvoiceStatus.PAID
            """)
    BigDecimal sumOutstandingByCreditCardId(
            @Param("creditCardId") Long creditCardId,
            @Param("workspaceId") Long workspaceId
    );
}
