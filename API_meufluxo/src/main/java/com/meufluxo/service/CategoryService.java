package com.meufluxo.service;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.common.exception.NotFoundException;
import com.meufluxo.dto.category.CategoryRequest;
import com.meufluxo.dto.category.CategoryResponse;
import com.meufluxo.dto.category.CategoryUpdateRequest;
import com.meufluxo.mapper.CategoryMapper;
import com.meufluxo.model.Category;
import com.meufluxo.repository.CashMovementRepository;
import com.meufluxo.repository.CategoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CashMovementRepository cashMovementRepository;
    private final CategoryMapper categoryMapper;

    public CategoryService(
            CategoryRepository categoryRepository,
            CashMovementRepository cashMovementRepository,
            CategoryMapper categoryMapper)
    {
        this.categoryRepository = categoryRepository;
        this.cashMovementRepository = cashMovementRepository;
        this.categoryMapper = categoryMapper;
    }

    @Transactional(readOnly = true)
    public CategoryResponse findById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Categoria não encontrada com ID: " + id));
        return categoryMapper.toResponse(category);
    }

    @Transactional(readOnly = true)
    public PageResponse<CategoryResponse> findAll(Pageable pageable) {
        Page<Category> categories = categoryRepository.findAll(pageable);
        Page<CategoryResponse> responsePage = categories.map(categoryMapper::toResponse);
        return PageResponse.toPageResponse(responsePage);
    }

    public CategoryResponse create(CategoryRequest categoryRequest) {
        if(categoryRepository.existsByName(categoryRequest.name())){
            throw new BusinessException("Já existe uma categoria com este nome");
        }
        Category newCategory = categoryMapper.toEntity(categoryRequest);
        newCategory = categoryRepository.save(newCategory);
        return categoryMapper.toResponse(newCategory);
    }

    public CategoryResponse update(Long id, CategoryUpdateRequest categoryRequest) {
        Category existingCategory = findByIdOrThrow(id);
        if(!existingCategory.getName().equals(categoryRequest.name())
            && categoryRepository.existsByNameAndIdNot(categoryRequest.name(), id)
        ) {
            throw new BusinessException("Já existe uma categoria com este nome");
        }
        existingCategory.setName(categoryRequest.name());
        existingCategory = categoryRepository.saveAndFlush(existingCategory);
        return categoryMapper.toResponse(existingCategory);
    }

    public void delete(Long id) {
        Category category = findByIdOrThrow(id);
        if( cashMovementRepository.existsByCategoryId(category.getId())) {
            throw new BusinessException("Não é possível excluir a categoria pois existem registros vinculados.");
        }
        categoryRepository.delete(category);
    }

    @Transactional(readOnly = true)
    public Category findByIdOrThrow(Long id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Categoria não encontrada com ID: " + id));
    }

    @Transactional(readOnly = true)
    public void existsId(Long id){
        categoryRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Categoria não encontrada com ID: " + id));
    }
}
