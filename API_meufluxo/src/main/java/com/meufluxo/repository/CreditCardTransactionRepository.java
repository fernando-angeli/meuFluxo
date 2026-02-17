package com.meufluxo.repository;

import com.meufluxo.model.CreditCardTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CreditCardTransactionRepository extends JpaRepository <CreditCardTransaction, Long> {
}
