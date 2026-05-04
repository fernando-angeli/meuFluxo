package com.meufluxo.repository;

import com.meufluxo.enums.FinancialDirection;
import com.meufluxo.enums.PlannedEntryStatus;
import com.meufluxo.model.PlannedEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlannedEntryRepository extends JpaRepository<PlannedEntry, Long>, JpaSpecificationExecutor<PlannedEntry> {

    boolean existsByCategory_IdAndWorkspace_Id(Long categoryId, Long workspaceId);

    boolean existsBySubCategory_IdAndWorkspace_Id(Long subCategoryId, Long workspaceId);

    @Override
    @EntityGraph(attributePaths = {"category", "subCategory", "defaultAccount", "settledAccount", "movement"})
    Page<PlannedEntry> findAll(Specification<PlannedEntry> spec, Pageable pageable);

    Optional<PlannedEntry> findByIdAndWorkspaceIdAndDirection(Long id, Long workspaceId, FinancialDirection direction);

    List<PlannedEntry> findByWorkspaceIdAndDirectionAndGroupIdAndStatusAndDueDateGreaterThanEqualOrderByDueDateAsc(
            Long workspaceId,
            FinancialDirection direction,
            UUID groupId,
            PlannedEntryStatus status,
            LocalDate dueDate
    );
}
