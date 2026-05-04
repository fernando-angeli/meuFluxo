package com.meufluxo.service;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.common.exception.NotFoundException;
import com.meufluxo.dto.subCategory.SubCategoryRequest;
import com.meufluxo.dto.subCategory.SubCategoryResponse;
import com.meufluxo.dto.subCategory.SubCategoryUpdateRequest;
import com.meufluxo.mapper.SubCategoryMapper;
import com.meufluxo.model.Category;
import com.meufluxo.model.SubCategory;
import com.meufluxo.repository.CashMovementRepository;
import com.meufluxo.repository.PlannedEntryRepository;
import com.meufluxo.repository.SubCategoryRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
public class SubCategoryService extends BaseUserService {
    private static final String DEFAULT_SUBCATEGORY_NAME = "Geral";

    private static final String SUBCATEGORY_DELETE_BLOCKED =
            "Não é possível excluir a subcategoria porque ainda está em uso no sistema. "
                    + "Inative-a para ocultá-la ao criar novas despesas e receitas.";

    private final SubCategoryRepository subCategoryRepository;
    private final CashMovementRepository cashMovementRepository;
    private final PlannedEntryRepository plannedEntryRepository;
    private final SubCategoryMapper subCategoryMapper;
    private final CategoryService categoryService;
    private final WorkspaceSyncStateService workspaceSyncStateService;

    public SubCategoryService(
            CurrentUserService currentUserService,
            SubCategoryRepository subCategoryRepository,
            CashMovementRepository cashMovementRepository,
            PlannedEntryRepository plannedEntryRepository,
            SubCategoryMapper subCategoryMapper,
            CategoryService categoryService,
            WorkspaceSyncStateService workspaceSyncStateService
    ) {
        super(currentUserService);
        this.subCategoryRepository = subCategoryRepository;
        this.cashMovementRepository = cashMovementRepository;
        this.plannedEntryRepository = plannedEntryRepository;
        this.subCategoryMapper = subCategoryMapper;
        this.categoryService = categoryService;
        this.workspaceSyncStateService = workspaceSyncStateService;
    }

    public SubCategoryResponse findById(Long id) {
        SubCategory subCategory = subCategoryRepository.findByIdAndWorkspaceId(id, getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("SubCategoria não encontrada com ID: " + id));
        return subCategoryMapper.toResponse(subCategory);
    }

    public PageResponse<SubCategoryResponse> findAll(Pageable pageable) {
        Page<SubCategory> categories = subCategoryRepository.findAllByWorkspaceId(getCurrentWorkspaceId(), pageable);
        Page<SubCategoryResponse> responsePage = categories.map(subCategoryMapper::toResponse);
        return PageResponse.toPageResponse(responsePage);
    }

    /**
     * Lista subcategorias apenas da categoria informada (mesmo workspace).
     */
    public PageResponse<SubCategoryResponse> findAllByCategory(Long categoryId, Pageable pageable) {
        categoryService.findByIdOrThrow(categoryId);
        Page<SubCategory> page = subCategoryRepository.findByCategory_IdAndWorkspaceId(
                categoryId,
                getCurrentWorkspaceId(),
                pageable
        );
        return PageResponse.toPageResponse(page.map(subCategoryMapper::toResponse));
    }

    @Transactional
    public SubCategoryResponse create(SubCategoryRequest request) {
        if (subCategoryRepository.existsByNameAndCategoryIdAndWorkspaceId(request.name(), request.categoryId(), getCurrentWorkspaceId())) {
            throw new BusinessException("Já existe uma subcategoria com este nome");
        }
        Category category = categoryService.findByIdOrThrow(request.categoryId());
        if (!category.isActive()) {
            throw new BusinessException("Não é possível criar subcategoria em uma categoria inativa.");
        }
        SubCategory newSubCategory = subCategoryMapper.toEntity(request);
        newSubCategory.setCategory(category);
        newSubCategory.setWorkspace(getCurrentWorkspace());
        newSubCategory.setDescription(trimToNull(request.description()));
        newSubCategory = subCategoryRepository.save(newSubCategory);
        workspaceSyncStateService.incrementCategoriesVersion(getCurrentWorkspaceId());
        return subCategoryMapper.toResponse(newSubCategory);
    }

    @Transactional
    public SubCategoryResponse update(
            Long id,
            SubCategoryUpdateRequest request
    ) {
        SubCategory existingSubCategory = findByIdOrThrow(id);
        Category parent = existingSubCategory.getCategory();
        if (!parent.isActive()) {
            throw new BusinessException("Categoria inativa: reative a categoria para alterar subcategorias.");
        }
        assertSubCategoryEditableWhenInactive(existingSubCategory, request);

        String targetName = request.name() != null ? request.name().trim() : existingSubCategory.getName();
        Long targetCategoryId = request.categoryId() != null ? request.categoryId() : existingSubCategory.getCategory().getId();

        if (request.name() != null) {
            if (targetName.isBlank())
                throw new BusinessException("Nome não pode ser vazio.");
            existingSubCategory.setName(targetName);
        }
        if (request.categoryId() != null) {
            Category newCategory = categoryService.findByIdOrThrow(request.categoryId());
            if (!newCategory.isActive()) {
                throw new BusinessException("Não é possível mover a subcategoria para uma categoria inativa.");
            }
            Category lastCategory = categoryService.findByIdOrThrow(existingSubCategory.getCategory().getId());
            if(newCategory.getMovementType() != lastCategory.getMovementType()){
                throw new BusinessException("Não é possível mudar categoria de " + lastCategory.getMovementType() + " por " + newCategory.getMovementType());
            }
            existingSubCategory.setCategory(newCategory);
        }

        if (subCategoryRepository.existsByNameAndCategoryIdAndWorkspaceIdAndIdNot(
                targetName,
                targetCategoryId,
                getCurrentWorkspaceId(),
                id
        )) {
            throw new BusinessException("Já existe uma subcategoria com este nome");
        }

        if (request.active() != null) {
            existingSubCategory.setActive(request.active());
        }
        if (request.description() != null) {
            existingSubCategory.setDescription(trimToNull(request.description()));
        }
        existingSubCategory = subCategoryRepository.saveAndFlush(existingSubCategory);
        workspaceSyncStateService.incrementCategoriesVersion(getCurrentWorkspaceId());
        return subCategoryMapper.toResponse(existingSubCategory);
    }

    @Transactional
    public void delete(Long id) {
        SubCategory subCategory = findByIdOrThrow(id);
        Long workspaceId = getCurrentWorkspaceId();
        if (plannedEntryRepository.existsBySubCategory_IdAndWorkspace_Id(id, workspaceId)) {
            throw new BusinessException(SUBCATEGORY_DELETE_BLOCKED);
        }
        if (cashMovementRepository.existsBySubCategoryIdAndWorkspaceId(id, workspaceId)) {
            throw new BusinessException(SUBCATEGORY_DELETE_BLOCKED);
        }
        subCategoryRepository.delete(subCategory);
        workspaceSyncStateService.incrementCategoriesVersion(getCurrentWorkspaceId());
    }

    public SubCategory findByIdOrThrow(Long id) {
        return subCategoryRepository.findByIdAndWorkspaceId(id, getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("SubCategoria não encontrada com ID: " + id));
    }

    public void existsId(Long id) {
        subCategoryRepository.findByIdAndWorkspaceId(id, getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("SubCategoria não encontrada com ID: " + id));
    }

    @Transactional
    public SubCategory getOrCreateDefaultForCategory(Category category) {
        Long workspaceId = getCurrentWorkspaceId();
        return subCategoryRepository
                .findByNameIgnoreCaseAndCategoryIdAndWorkspaceId(DEFAULT_SUBCATEGORY_NAME, category.getId(), workspaceId)
                .orElseGet(() -> createDefaultSubCategory(category, workspaceId));
    }

    private SubCategory createDefaultSubCategory(Category category, Long workspaceId) {
        SubCategory subCategory = new SubCategory();
        subCategory.setName(DEFAULT_SUBCATEGORY_NAME);
        subCategory.setDescription("Subcategoria padrão gerada automaticamente.");
        subCategory.setCategory(category);
        subCategory.setWorkspace(getCurrentWorkspace());

        try {
            SubCategory saved = subCategoryRepository.saveAndFlush(subCategory);
            workspaceSyncStateService.incrementCategoriesVersion(workspaceId);
            return saved;
        } catch (DataIntegrityViolationException e) {
            return subCategoryRepository
                    .findByNameIgnoreCaseAndCategoryIdAndWorkspaceId(DEFAULT_SUBCATEGORY_NAME, category.getId(), workspaceId)
                    .orElseThrow(() -> e);
        }
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static void assertSubCategoryEditableWhenInactive(SubCategory existing, SubCategoryUpdateRequest request) {
        if (existing.isActive()) {
            return;
        }
        if (Boolean.TRUE.equals(request.active())) {
            return;
        }
        if (request.categoryId() != null && !request.categoryId().equals(existing.getCategory().getId())) {
            throw new BusinessException("Subcategoria inativa: reative-a antes de alterar a categoria pai.");
        }
        if (request.name() != null) {
            String newName = request.name().trim();
            if (!newName.equals(existing.getName())) {
                throw new BusinessException("Subcategoria inativa: reative-a para alterar o nome ou a descrição.");
            }
        }
        if (request.description() != null
                && !Objects.equals(trimToNull(request.description()), existing.getDescription())) {
            throw new BusinessException("Subcategoria inativa: reative-a para alterar o nome ou a descrição.");
        }
    }

}
