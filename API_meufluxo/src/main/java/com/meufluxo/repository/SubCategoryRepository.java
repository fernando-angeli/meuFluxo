package com.meufluxo.repository;

import com.meufluxo.model.SubCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {
    boolean existsByNameAndCategoryIdAndWorkspaceId(String categoryName, Long categoryId, Long workspaceId);

    boolean existsByNameAndCategoryIdAndWorkspaceIdAndIdNot(
            String categoryName,
            Long categoryId,
            Long workspaceId,
            Long id
    );

    boolean existsByCategoryId(Long categoryId);

    Optional<SubCategory> findByIdAndWorkspaceId(Long id, Long currentWorkspaceId);

    Page<SubCategory> findAllByWorkspaceId(Long currentWorkspaceId, Pageable pageable);

}
