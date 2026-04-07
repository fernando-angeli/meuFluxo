package com.meufluxo.repository;

import com.meufluxo.model.CreditCard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CreditCardRepository extends JpaRepository<CreditCard, Long> {

    Page<CreditCard> findAllByWorkspaceId(Long workspaceId, Pageable pageable);
    Page<CreditCard> findAllByWorkspaceIdAndActive(Long workspaceId, boolean active, Pageable pageable);

    List<CreditCard> findAllByWorkspaceIdOrderByIdAsc(Long workspaceId);

    Optional<CreditCard> findByIdAndWorkspaceId(Long id, Long workspaceId);

    boolean existsByNameAndWorkspaceId(String name, Long workspaceId);

    boolean existsByNameAndWorkspaceIdAndIdNot(String name, Long workspaceId, Long id);
}
