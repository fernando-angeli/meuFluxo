package com.meufluxo.repository;

import com.meufluxo.model.CreditCardExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface CreditCardExpenseRepository extends JpaRepository<CreditCardExpense, Long>, JpaSpecificationExecutor<CreditCardExpense> {
    Optional<CreditCardExpense> findByIdAndWorkspaceId(Long id, Long workspaceId);
    List<CreditCardExpense> findAllByInvoiceIdAndWorkspaceIdOrderByPurchaseDateDescIdDesc(Long invoiceId, Long workspaceId);
}
