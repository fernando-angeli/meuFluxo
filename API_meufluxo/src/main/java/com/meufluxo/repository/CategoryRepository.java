package com.meufluxo.repository;

import com.meufluxo.model.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByIdAndWorkspaceId(Long id, Long workspaceId);

    Page<Category> findAllByWorkspaceId(Long workspaceId, Pageable pageable);

    boolean existsByNameAndWorkspaceId(String categoryName, Long workspaceId);

    boolean existsByNameAndWorkspaceIdAndIdNot(String categoryName, Long workspaceId, Long categoryId);

    Long findIdByName(String name);

}
