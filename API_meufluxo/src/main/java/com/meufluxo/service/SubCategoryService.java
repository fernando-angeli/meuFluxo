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
import com.meufluxo.repository.SubCategoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubCategoryService extends BaseUserService {

    private final SubCategoryRepository subCategoryRepository;
    private final CashMovementRepository cashMovementRepository;
    private final SubCategoryMapper subCategoryMapper;
    private final CategoryService categoryService;
    private final WorkspaceSyncStateService workspaceSyncStateService;

    public SubCategoryService(
            CurrentUserService currentUserService,
            SubCategoryRepository subCategoryRepository,
            CashMovementRepository cashMovementRepository,
            SubCategoryMapper subCategoryMapper,
            CategoryService categoryService,
            WorkspaceSyncStateService workspaceSyncStateService
    ) {
        super(currentUserService);
        this.subCategoryRepository = subCategoryRepository;
        this.cashMovementRepository = cashMovementRepository;
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

    @Transactional
    public SubCategoryResponse create(SubCategoryRequest request) {
        if (subCategoryRepository.existsByNameAndCategoryIdAndWorkspaceId(request.name(), request.categoryId(), getCurrentWorkspaceId())) {
            throw new BusinessException("Já existe uma subcategoria com este nome");
        }
        Category category = categoryService.findByIdOrThrow(request.categoryId());
        SubCategory newSubCategory = subCategoryMapper.toEntity(request);
        newSubCategory.setCategory(category);
        newSubCategory.setWorkspace(getCurrentWorkspace());
        newSubCategory = subCategoryRepository.save(newSubCategory);
        workspaceSyncStateService.incrementSubCategoriesVersion(getCurrentWorkspaceId());
        return subCategoryMapper.toResponse(newSubCategory);
    }

    @Transactional
    public SubCategoryResponse update(
            Long id,
            SubCategoryUpdateRequest request
    ) {
        SubCategory existingSubCategory = findByIdOrThrow(id);
        String targetName = request.name() != null ? request.name().trim() : existingSubCategory.getName();
        Long targetCategoryId = request.categoryId() != null ? request.categoryId() : existingSubCategory.getCategory().getId();

        if (request.name() != null) {
            if (targetName.isBlank())
                throw new BusinessException("Nome não pode ser vazio.");
            existingSubCategory.setName(targetName);
        }
        if (request.categoryId() != null) {
            Category newCategory = categoryService.findByIdOrThrow(request.categoryId());
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
            throw new BusinessException("Já existe uma categoria com este nome");
        }

        if (request.active() != null) {
            existingSubCategory.setActive(request.active());
        }
        existingSubCategory = subCategoryRepository.saveAndFlush(existingSubCategory);
        workspaceSyncStateService.incrementSubCategoriesVersion(getCurrentWorkspaceId());
        return subCategoryMapper.toResponse(existingSubCategory);
    }

    @Transactional
    public void delete(Long id) {
        SubCategory subCategory = findByIdOrThrow(id);
        if (cashMovementRepository.existsBySubCategoryIdAndWorkspaceId(id, getCurrentWorkspaceId())) {
            throw new BusinessException("Não é possível excluir a categoria pois existem registros vinculados, só é possível inativa-la.");
        }
        subCategoryRepository.delete(subCategory);
        workspaceSyncStateService.incrementSubCategoriesVersion(getCurrentWorkspaceId());
    }

    public SubCategory findByIdOrThrow(Long id) {
        return subCategoryRepository.findByIdAndWorkspaceId(id, getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("SubCategoria não encontrada com ID: " + id));
    }

    public void existsId(Long id) {
        subCategoryRepository.findByIdAndWorkspaceId(id, getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("SubCategoria não encontrada com ID: " + id));
    }

}
