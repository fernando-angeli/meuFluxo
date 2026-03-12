package com.meufluxo.repository;

import com.meufluxo.model.CreditCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CreditCardRepository extends JpaRepository <CreditCard, Long> {

    List<CreditCard> findAllByWorkspaceIdOrderByIdAsc(Long workspaceId);

    Optional<CreditCard> findByIdAndWorkspaceId(Long id, Long workspaceId);
}
