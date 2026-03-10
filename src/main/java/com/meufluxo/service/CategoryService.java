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
import com.meufluxo.repository.SubCategoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService extends BaseUserService {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final CashMovementRepository cashMovementRepository;
    private final CategoryMapper categoryMapper;

    public CategoryService(
            CurrentUserService currentUserService,
            CategoryRepository categoryRepository,
            SubCategoryRepository subCategoryRepository,
            CashMovementRepository cashMovementRepository,
            CategoryMapper categoryMapper
    ) {
        super(currentUserService);
        this.categoryRepository = categoryRepository;
        this.subCategoryRepository = subCategoryRepository;
        this.cashMovementRepository = cashMovementRepository;
        this.categoryMapper = categoryMapper;
    }

    public CategoryResponse findById(Long id) {
        Category category = categoryRepository.findByIdAndWorkspaceId(id, getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("Categoria não encontrada com ID: " + id));
        return categoryMapper.toResponse(category);
    }

    public PageResponse<CategoryResponse> findAll(Pageable pageable) {
        Page<Category> categories = categoryRepository.findAllByWorkspaceId(getCurrentWorkspaceId(), pageable);
        Page<CategoryResponse> responsePage = categories.map(categoryMapper::toResponse);
        return PageResponse.toPageResponse(responsePage);
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByNameAndWorkspaceId(request.name(), getCurrentWorkspaceId())) {
            throw new BusinessException("Já existe uma categoria com este nome");
        }
        Category newCategory = categoryMapper.toEntity(request);
        newCategory.setWorkspace(getCurrentWorkspace());
        newCategory = categoryRepository.save(newCategory);
        return categoryMapper.toResponse(newCategory);
    }

    @Transactional
    public CategoryResponse update(
            Long id,
            CategoryUpdateRequest request
    ) {
        Category existingCategory = findByIdOrThrow(id);
        if (request.name() != null) {
            String newName = request.name().trim();
            if (newName.isBlank())
                throw new BusinessException("Nome não pode ser vazio.");
            if (!newName.equals(existingCategory.getName())
                    && categoryRepository.existsByNameAndWorkspaceIdAndIdNot(request.name(), getCurrentWorkspaceId(), id)) {
                throw new BusinessException("Já existe uma categoria com este nome");
            }
            existingCategory.setName(newName);
        }
        if (request.active() != null) {
            existingCategory.setActive(request.active());
        }
        existingCategory = categoryRepository.saveAndFlush(existingCategory);
        return categoryMapper.toResponse(existingCategory);
    }

    @Transactional
    public void delete(Long id) {
        Category category = findByIdOrThrow(id);
        if (cashMovementRepository.existsBySubCategoryCategoryIdAndWorkspaceId(id, getCurrentWorkspaceId())) {
            throw new BusinessException("Não é possível excluir a categoria pois existem registros vinculados, só é possível inativa-la.");
        }
        if (subCategoryRepository.existsByCategoryId(id)){
            throw new BusinessException("Não é possível excluir a categoria pois existem subcategorias vinculados, só é possível inativa-la.");
        }
        categoryRepository.delete(category);
    }

    public Category findByIdOrThrow(Long id) {
        return categoryRepository.findByIdAndWorkspaceId(id, getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("Categoria não encontrada com ID: " + id));
    }

    public void existsId(Long id) {
        categoryRepository.findByIdAndWorkspaceId(id, getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("Categoria não encontrada com ID: " + id));
    }

}
