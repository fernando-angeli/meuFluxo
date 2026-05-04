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
import com.meufluxo.repository.PlannedEntryRepository;
import com.meufluxo.repository.SubCategoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
public class CategoryService extends BaseUserService {

    private static final String CATEGORY_DELETE_BLOCKED =
            "Não é possível excluir a categoria porque ainda está em uso no sistema (movimentações, lançamentos planejados ou subcategorias). "
                    + "Inative-a para ocultá-la ao criar novas despesas e receitas.";

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final CashMovementRepository cashMovementRepository;
    private final PlannedEntryRepository plannedEntryRepository;
    private final CategoryMapper categoryMapper;
    private final WorkspaceSyncStateService workspaceSyncStateService;

    public CategoryService(
            CurrentUserService currentUserService,
            CategoryRepository categoryRepository,
            SubCategoryRepository subCategoryRepository,
            CashMovementRepository cashMovementRepository,
            PlannedEntryRepository plannedEntryRepository,
            CategoryMapper categoryMapper,
            WorkspaceSyncStateService workspaceSyncStateService
    ) {
        super(currentUserService);
        this.categoryRepository = categoryRepository;
        this.subCategoryRepository = subCategoryRepository;
        this.cashMovementRepository = cashMovementRepository;
        this.plannedEntryRepository = plannedEntryRepository;
        this.categoryMapper = categoryMapper;
        this.workspaceSyncStateService = workspaceSyncStateService;
    }

    public CategoryResponse findById(Long id) {
        Category category = categoryRepository.findByIdAndWorkspaceId(id, getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("Categoria não encontrada com ID: " + id));
        return toResponseWithSubCategoryCount(category);
    }

    public PageResponse<CategoryResponse> findAll(Pageable pageable) {
        Page<Category> categories = categoryRepository.findAllByWorkspaceId(getCurrentWorkspaceId(), pageable);
        Page<CategoryResponse> responsePage = categories.map(this::toResponseWithSubCategoryCount);
        return PageResponse.toPageResponse(responsePage);
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByNameAndWorkspaceId(request.name(), getCurrentWorkspaceId())) {
            throw new BusinessException("Já existe uma categoria com este nome");
        }
        Category newCategory = categoryMapper.toEntity(request);
        newCategory.setWorkspace(getCurrentWorkspace());
        newCategory.setDescription(trimToNull(request.description()));
        newCategory = categoryRepository.save(newCategory);
        workspaceSyncStateService.incrementCategoriesVersion(getCurrentWorkspaceId());
        return toResponseWithSubCategoryCount(newCategory);
    }

    @Transactional
    public CategoryResponse update(
            Long id,
            CategoryUpdateRequest request
    ) {
        Category existingCategory = findByIdOrThrow(id);
        assertCategoryEditableWhenInactive(existingCategory, request);

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
        if (request.description() != null) {
            existingCategory.setDescription(trimToNull(request.description()));
        }
        existingCategory = categoryRepository.saveAndFlush(existingCategory);
        workspaceSyncStateService.incrementCategoriesVersion(getCurrentWorkspaceId());
        return toResponseWithSubCategoryCount(existingCategory);
    }

    @Transactional
    public void delete(Long id) {
        Category category = findByIdOrThrow(id);
        Long workspaceId = getCurrentWorkspaceId();
        if (plannedEntryRepository.existsByCategory_IdAndWorkspace_Id(id, workspaceId)) {
            throw new BusinessException(CATEGORY_DELETE_BLOCKED);
        }
        if (cashMovementRepository.existsBySubCategoryCategoryIdAndWorkspaceId(id, workspaceId)) {
            throw new BusinessException(CATEGORY_DELETE_BLOCKED);
        }
        if (subCategoryRepository.existsByCategoryId(id)) {
            throw new BusinessException(CATEGORY_DELETE_BLOCKED);
        }
        categoryRepository.delete(category);
        workspaceSyncStateService.incrementCategoriesVersion(getCurrentWorkspaceId());
    }

    public Category findByIdOrThrow(Long id) {
        return categoryRepository.findByIdAndWorkspaceId(id, getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("Categoria não encontrada com ID: " + id));
    }

    public void existsId(Long id) {
        categoryRepository.findByIdAndWorkspaceId(id, getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("Categoria não encontrada com ID: " + id));
    }

    /**
     * Monta {@link CategoryResponse} com contagem real de subcategorias (workspace atual).
     */
    public CategoryResponse toResponseWithSubCategoryCount(Category category) {
        CategoryResponse base = categoryMapper.toResponse(category);
        long count = subCategoryRepository.countByCategory_IdAndWorkspaceId(category.getId(), getCurrentWorkspaceId());
        return new CategoryResponse(
                base.id(),
                base.name(),
                base.movementType(),
                base.meta(),
                base.description(),
                count
        );
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static void assertCategoryEditableWhenInactive(Category existing, CategoryUpdateRequest request) {
        if (existing.isActive()) {
            return;
        }
        if (Boolean.TRUE.equals(request.active())) {
            return;
        }
        if (request.name() != null) {
            String newName = request.name().trim();
            if (!newName.equals(existing.getName())) {
                throw new BusinessException("Categoria inativa: reative-a para alterar o nome ou a descrição.");
            }
        }
        if (request.description() != null
                && !Objects.equals(trimToNull(request.description()), existing.getDescription())) {
            throw new BusinessException("Categoria inativa: reative-a para alterar o nome ou a descrição.");
        }
    }

}
