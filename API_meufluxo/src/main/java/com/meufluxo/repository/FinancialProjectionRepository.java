package com.meufluxo.repository;

import com.meufluxo.model.FinancialProjection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FinancialProjectionRepository extends JpaRepository <FinancialProjection, Long> {
}
