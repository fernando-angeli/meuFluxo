package com.meufluxo.repository;

import com.meufluxo.model.SubCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {
    boolean existsByNameAndCategoryIdAndUserId(String categoryName, Long categoryId, Long userId);

    boolean existsByNameAndIdNot(String categoryName, Long categoryId);

    boolean existsByCategoryId(Long categoryId);

    Optional<SubCategory> findByIdAndUserId(Long id, Long currentUserId);

    Page<SubCategory> findAllByUserId(Long currentUserId, Pageable pageable);

}
