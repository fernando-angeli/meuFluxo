package com.meufluxo.repository;

import com.meufluxo.model.CreditCard;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CreditCardRepository extends JpaRepository <CreditCard, Long> {
}
