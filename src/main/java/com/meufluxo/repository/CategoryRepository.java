package com.meufluxo.repository;

import com.meufluxo.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByName(String categoryName);

    boolean existsByNameAndIdNot(String categoryName, Long categoryId);

    Long findIdByName(String name);
}
