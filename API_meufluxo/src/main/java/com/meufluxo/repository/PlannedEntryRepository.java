package com.meufluxo.repository;

import com.meufluxo.enums.FinancialDirection;
import com.meufluxo.enums.PlannedEntryStatus;
import com.meufluxo.model.PlannedEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlannedEntryRepository extends JpaRepository<PlannedEntry, Long>, JpaSpecificationExecutor<PlannedEntry> {

    Optional<PlannedEntry> findByIdAndWorkspaceIdAndDirection(Long id, Long workspaceId, FinancialDirection direction);

    List<PlannedEntry> findByWorkspaceIdAndDirectionAndGroupIdAndStatusAndDueDateGreaterThanEqualOrderByDueDateAsc(
            Long workspaceId,
            FinancialDirection direction,
            UUID groupId,
            PlannedEntryStatus status,
            LocalDate dueDate
    );
}
