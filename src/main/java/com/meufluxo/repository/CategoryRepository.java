package com.meufluxo.repository;

import com.meufluxo.model.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByIdAndUserId(Long id, Long userId);

    Page<Category> findAllByUserId(Long userId, Pageable pageable);

    boolean existsByNameAndUserId(String categoryName, Long userId);

    boolean existsByNameAndIdNot(String categoryName, Long categoryId);

    Long findIdByName(String name);

}
