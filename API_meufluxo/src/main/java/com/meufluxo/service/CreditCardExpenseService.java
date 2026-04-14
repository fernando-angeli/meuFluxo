package com.meufluxo.service;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.common.exception.NotFoundException;
import com.meufluxo.dto.creditCardExpense.CreditCardExpenseCreateResponse;
import com.meufluxo.dto.creditCardExpense.CreditCardExpenseRequest;
import com.meufluxo.dto.creditCardExpense.CreditCardExpenseResponse;
import com.meufluxo.dto.creditCardExpense.CreditCardExpenseUpdateRequest;
import com.meufluxo.enums.CreditCardExpenseStatus;
import com.meufluxo.mapper.CreditCardExpenseMapper;
import com.meufluxo.model.Category;
import com.meufluxo.model.CreditCard;
import com.meufluxo.model.CreditCardExpense;
import com.meufluxo.model.CreditCardInvoice;
import com.meufluxo.model.SubCategory;
import com.meufluxo.repository.CreditCardExpenseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class CreditCardExpenseService extends BaseUserService {
    private static final Logger log = LoggerFactory.getLogger(CreditCardExpenseService.class);

    private final CreditCardExpenseRepository creditCardExpenseRepository;
    private final CreditCardExpenseMapper creditCardExpenseMapper;
    private final CreditCardService creditCardService;
    private final CreditCardInvoiceService creditCardInvoiceService;
    private final CategoryService categoryService;
    private final SubCategoryService subCategoryService;
    private final WorkspaceSyncStateService workspaceSyncStateService;

    public CreditCardExpenseService(
            CurrentUserService currentUserService,
            CreditCardExpenseRepository creditCardExpenseRepository,
            CreditCardExpenseMapper creditCardExpenseMapper,
            CreditCardService creditCardService,
            CreditCardInvoiceService creditCardInvoiceService,
            CategoryService categoryService,
            SubCategoryService subCategoryService,
            WorkspaceSyncStateService workspaceSyncStateService
    ) {
        super(currentUserService);
        this.creditCardExpenseRepository = creditCardExpenseRepository;
        this.creditCardExpenseMapper = creditCardExpenseMapper;
        this.creditCardService = creditCardService;
        this.creditCardInvoiceService = creditCardInvoiceService;
        this.categoryService = categoryService;
        this.subCategoryService = subCategoryService;
        this.workspaceSyncStateService = workspaceSyncStateService;
    }

    public CreditCardExpenseResponse findById(Long id) {
        return creditCardExpenseMapper.toResponse(findByIdOrThrow(id));
    }

    public PageResponse<CreditCardExpenseResponse> findByFilters(
            Long creditCardId,
            Long invoiceId,
            Long categoryId,
            Long subcategoryId,
            LocalDate purchaseDateStart,
            LocalDate purchaseDateEnd,
            UUID installmentGroupId,
            Pageable pageable
    ) {
        Optional.ofNullable(creditCardId).ifPresent(creditCardService::findByIdOrThrow);
        Optional.ofNullable(invoiceId).ifPresent(creditCardInvoiceService::findByIdOrThrow);
        Optional.ofNullable(categoryId).ifPresent(categoryService::existsId);
        Optional.ofNullable(subcategoryId).ifPresent(subCategoryService::existsId);
        validateDateRange(purchaseDateStart, purchaseDateEnd);

        Long workspaceId = getCurrentWorkspaceId();
        Specification<CreditCardExpense> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("workspace").get("id"), workspaceId));

            if (creditCardId != null) {
                predicates.add(cb.equal(root.get("creditCard").get("id"), creditCardId));
            }
            if (invoiceId != null) {
                predicates.add(cb.equal(root.get("invoice").get("id"), invoiceId));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (subcategoryId != null) {
                predicates.add(cb.equal(root.get("subcategory").get("id"), subcategoryId));
            }
            if (purchaseDateStart != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("purchaseDate"), purchaseDateStart));
            }
            if (purchaseDateEnd != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("purchaseDate"), purchaseDateEnd));
            }
            if (installmentGroupId != null) {
                predicates.add(cb.equal(root.get("installmentGroupId"), installmentGroupId));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<CreditCardExpense> page = creditCardExpenseRepository.findAll(spec, pageable);
        return PageResponse.toPageResponse(page.map(creditCardExpenseMapper::toResponse));
    }

    @Transactional
    public CreditCardExpenseCreateResponse create(CreditCardExpenseRequest request) {
        log.info(
                "Criando lançamento de cartão. creditCardIdRecebido={}, workspaceId={}, userId={}, categoryId={}, subcategoryId={}, purchaseDate={}, installmentCount={}",
                request.creditCardId(),
                getCurrentWorkspaceId(),
                currentUserService.getCurrentUserId(),
                request.categoryId(),
                request.subcategoryId(),
                request.purchaseDate(),
                request.installmentCount()
        );
        CreditCard creditCard = creditCardService.findByIdOrThrow(request.creditCardId());
        Category category = categoryService.findByIdOrThrow(request.categoryId());
        SubCategory subCategory = subCategoryService.findByIdOrThrow(request.subcategoryId());
        validateSubCategoryBelongsToCategory(category, subCategory);

        int installmentCount = normalizeInstallmentCount(request.installmentCount());
        UUID installmentGroupId = installmentCount > 1 ? UUID.randomUUID() : null;

        List<BigDecimal> installmentAmounts = splitAmountByInstallments(request.totalAmount(), installmentCount);
        List<CreditCardExpense> savedExpenses = new ArrayList<>();
        Set<Long> touchedInvoices = new LinkedHashSet<>();

        for (int installmentNumber = 1; installmentNumber <= installmentCount; installmentNumber++) {
            LocalDate installmentPurchaseDate = request.purchaseDate().plusMonths(installmentNumber - 1L);
            CreditCardInvoice invoice = creditCardInvoiceService.findOrCreateForPurchaseDate(creditCard, installmentPurchaseDate);
            creditCardInvoiceService.assertInvoiceOpen(invoice);

            CreditCardExpense expense = new CreditCardExpense();
            expense.setWorkspace(getCurrentWorkspace());
            expense.setCreditCard(creditCard);
            expense.setInvoice(invoice);
            expense.setDescription(request.description().trim());
            expense.setPurchaseDate(installmentPurchaseDate);
            expense.setCategory(category);
            expense.setSubcategory(subCategory);
            expense.setAmount(installmentAmounts.get(installmentNumber - 1));
            expense.setInstallmentNumber(installmentNumber);
            expense.setInstallmentCount(installmentCount);
            expense.setInstallmentGroupId(installmentGroupId);
            expense.setNotes(trimToNull(request.notes()));
            expense.setStatus(CreditCardExpenseStatus.OPEN);
            savedExpenses.add(creditCardExpenseRepository.save(expense));
            touchedInvoices.add(invoice.getId());
        }

        touchedInvoices.forEach(creditCardInvoiceService::recalculateInvoiceTotals);
        workspaceSyncStateService.incrementCreditCardsVersion(getCurrentWorkspaceId());

        List<CreditCardExpenseResponse> responses = savedExpenses.stream()
                .map(creditCardExpenseMapper::toResponse)
                .toList();
        return new CreditCardExpenseCreateResponse(
                installmentGroupId,
                installmentCount,
                request.totalAmount().setScale(2, java.math.RoundingMode.HALF_UP),
                responses
        );
    }

    @Transactional
    public CreditCardExpenseResponse update(Long id, CreditCardExpenseUpdateRequest request) {
        CreditCardExpense expense = findByIdOrThrow(id);
        creditCardInvoiceService.assertInvoiceOpen(expense.getInvoice());

        Category category = categoryService.findByIdOrThrow(request.categoryId());
        SubCategory subCategory = subCategoryService.findByIdOrThrow(request.subcategoryId());
        validateSubCategoryBelongsToCategory(category, subCategory);

        CreditCardInvoice oldInvoice = expense.getInvoice();
        CreditCardInvoice newInvoice = creditCardInvoiceService.findOrCreateForPurchaseDate(expense.getCreditCard(), request.purchaseDate());
        creditCardInvoiceService.assertInvoiceOpen(newInvoice);

        expense.setDescription(request.description().trim());
        expense.setPurchaseDate(request.purchaseDate());
        expense.setCategory(category);
        expense.setSubcategory(subCategory);
        expense.setAmount(request.amount().setScale(2, java.math.RoundingMode.HALF_UP));
        expense.setNotes(trimToNull(request.notes()));
        expense.setInvoice(newInvoice);

        CreditCardExpense saved = creditCardExpenseRepository.save(expense);

        creditCardInvoiceService.recalculateInvoiceTotals(oldInvoice.getId());
        if (!oldInvoice.getId().equals(newInvoice.getId())) {
            creditCardInvoiceService.recalculateInvoiceTotals(newInvoice.getId());
        }

        workspaceSyncStateService.incrementCreditCardsVersion(getCurrentWorkspaceId());
        return creditCardExpenseMapper.toResponse(saved);
    }

    @Transactional
    public CreditCardExpenseResponse cancel(Long id) {
        CreditCardExpense expense = findByIdOrThrow(id);
        creditCardInvoiceService.assertInvoiceOpen(expense.getInvoice());

        expense.setStatus(CreditCardExpenseStatus.CANCELED);
        CreditCardExpense saved = creditCardExpenseRepository.save(expense);
        creditCardInvoiceService.recalculateInvoiceTotals(expense.getInvoice().getId());
        workspaceSyncStateService.incrementCreditCardsVersion(getCurrentWorkspaceId());
        return creditCardExpenseMapper.toResponse(saved);
    }

    public CreditCardExpense findByIdOrThrow(Long id) {
        return creditCardExpenseRepository.findByIdAndWorkspaceId(id, getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("Lançamento de cartão não encontrado com ID: " + id));
    }

    private void validateSubCategoryBelongsToCategory(Category category, SubCategory subCategory) {
        if (!subCategory.getCategory().getId().equals(category.getId())) {
            throw new BusinessException("A subcategoria informada não pertence à categoria selecionada.");
        }
    }

    private int normalizeInstallmentCount(Integer installmentCount) {
        int normalized = installmentCount == null ? 1 : installmentCount;
        if (normalized < 1) {
            throw new BusinessException("installmentCount deve ser maior ou igual a 1.");
        }
        return normalized;
    }

    private List<BigDecimal> splitAmountByInstallments(BigDecimal totalAmount, int installmentCount) {
        BigDecimal normalizedTotal = totalAmount.setScale(2, java.math.RoundingMode.HALF_UP);
        long totalCents = normalizedTotal.movePointRight(2).longValueExact();
        long baseCents = totalCents / installmentCount;
        long remainder = totalCents % installmentCount;

        List<BigDecimal> values = new ArrayList<>(installmentCount);
        for (int i = 1; i <= installmentCount; i++) {
            long cents = baseCents;
            if (i == installmentCount) {
                cents += remainder;
            }
            values.add(BigDecimal.valueOf(cents, 2));
        }
        return values;
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new BusinessException("startDate deve ser menor ou igual a endDate.");
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
