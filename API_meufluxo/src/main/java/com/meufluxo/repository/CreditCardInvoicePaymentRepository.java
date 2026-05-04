package com.meufluxo.repository;

import com.meufluxo.model.CreditCardInvoicePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CreditCardInvoicePaymentRepository extends JpaRepository<CreditCardInvoicePayment, Long>, JpaSpecificationExecutor<CreditCardInvoicePayment> {
    Optional<CreditCardInvoicePayment> findByIdAndWorkspaceId(Long id, Long workspaceId);
    List<CreditCardInvoicePayment> findAllByInvoiceIdAndWorkspaceIdOrderByPaymentDateDescIdDesc(Long invoiceId, Long workspaceId);

    @Query("""
            select coalesce(sum(p.amount), 0)
            from CreditCardInvoicePayment p
            where p.invoice.id = :invoiceId
              and p.active = true
            """)
    BigDecimal sumActivePaymentsByInvoiceId(@Param("invoiceId") Long invoiceId);

    @Query("""
            select p from CreditCardInvoicePayment p
            join fetch p.movement m
            join fetch p.invoice inv
            where p.workspace.id = :workspaceId
              and m.id in :movementIds
            """)
    List<CreditCardInvoicePayment> findAllByMovementIdInAndWorkspaceId(
            @Param("movementIds") Collection<Long> movementIds,
            @Param("workspaceId") Long workspaceId
    );
}
