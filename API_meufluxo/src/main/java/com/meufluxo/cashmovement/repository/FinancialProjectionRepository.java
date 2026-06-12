package com.meufluxo.cashmovement.repository;

import com.meufluxo.cashmovement.model.FinancialProjection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FinancialProjectionRepository extends JpaRepository <FinancialProjection, Long> {
}
