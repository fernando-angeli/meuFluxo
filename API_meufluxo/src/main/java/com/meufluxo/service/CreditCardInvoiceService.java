package com.meufluxo.service;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.common.exception.NotFoundException;
import com.meufluxo.dto.creditCardInvoice.CreditCardInvoiceDetailsExpenseItemResponse;
import com.meufluxo.dto.creditCardInvoice.CreditCardInvoiceDetailsPaymentItemResponse;
import com.meufluxo.dto.creditCardInvoice.CreditCardInvoiceDetailsResponse;
import com.meufluxo.dto.creditCardInvoice.CreditCardInvoiceListResponse;
import com.meufluxo.dto.creditCardInvoice.CreditCardInvoiceResponse;
import com.meufluxo.enums.CreditCardInvoiceStatus;
import com.meufluxo.mapper.CreditCardInvoiceMapper;
import com.meufluxo.model.CreditCard;
import com.meufluxo.model.CreditCardExpense;
import com.meufluxo.model.CreditCardInvoice;
import com.meufluxo.model.CreditCardInvoicePayment;
import com.meufluxo.repository.CreditCardExpenseRepository;
import com.meufluxo.repository.CreditCardInvoicePaymentRepository;
import com.meufluxo.repository.CreditCardInvoiceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CreditCardInvoiceService extends BaseUserService {

    private final CreditCardInvoiceRepository creditCardInvoiceRepository;
    private final CreditCardInvoicePaymentRepository creditCardInvoicePaymentRepository;
    private final CreditCardExpenseRepository creditCardExpenseRepository;
    private final CreditCardInvoiceCalculationService calculationService;
    private final CreditCardInvoiceMapper creditCardInvoiceMapper;
    private final CreditCardService creditCardService;

    public CreditCardInvoiceService(
            CurrentUserService currentUserService,
            CreditCardInvoiceRepository creditCardInvoiceRepository,
            CreditCardInvoicePaymentRepository creditCardInvoicePaymentRepository,
            CreditCardExpenseRepository creditCardExpenseRepository,
            CreditCardInvoiceCalculationService calculationService,
            CreditCardInvoiceMapper creditCardInvoiceMapper,
            CreditCardService creditCardService
    ) {
        super(currentUserService);
        this.creditCardInvoiceRepository = creditCardInvoiceRepository;
        this.creditCardInvoicePaymentRepository = creditCardInvoicePaymentRepository;
        this.creditCardExpenseRepository = creditCardExpenseRepository;
        this.calculationService = calculationService;
        this.creditCardInvoiceMapper = creditCardInvoiceMapper;
        this.creditCardService = creditCardService;
    }

    public CreditCardInvoiceResponse findById(Long id) {
        return creditCardInvoiceMapper.toResponse(findByIdOrThrow(id));
    }

    public CreditCardInvoice findByIdOrThrow(Long id) {
        return creditCardInvoiceRepository.findByIdAndCreditCardWorkspaceId(id, getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("Fatura de cartão não encontrada com ID: " + id));
    }

    public PageResponse<CreditCardInvoiceListResponse> findByFilters(
            Long creditCardId,
            CreditCardInvoiceStatus status,
            Integer referenceYear,
            Integer referenceMonth,
            LocalDate dueDateStart,
            LocalDate dueDateEnd,
            Pageable pageable
    ) {
        Optional.ofNullable(creditCardId).ifPresent(creditCardService::findByIdOrThrow);
        validateDateRange(dueDateStart, dueDateEnd, "dueDateStart", "dueDateEnd");

        Specification<CreditCardInvoice> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("creditCard").get("workspace").get("id"), getCurrentWorkspaceId()));

            if (creditCardId != null) {
                predicates.add(cb.equal(root.get("creditCard").get("id"), creditCardId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (referenceYear != null) {
                predicates.add(cb.equal(root.get("referenceYear"), referenceYear));
            }
            if (referenceMonth != null) {
                predicates.add(cb.equal(root.get("referenceMonth"), referenceMonth));
            }
            if (dueDateStart != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dueDate"), dueDateStart));
            }
            if (dueDateEnd != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dueDate"), dueDateEnd));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<CreditCardInvoice> page = creditCardInvoiceRepository.findAll(spec, pageable);
        return PageResponse.toPageResponse(page.map(creditCardInvoiceMapper::toListResponse));
    }

    public CreditCardInvoiceDetailsResponse getDetails(Long id) {
        CreditCardInvoice invoice = findByIdOrThrow(id);
        List<CreditCardExpense> expenses = creditCardExpenseRepository
                .findAllByInvoiceIdAndWorkspaceIdOrderByPurchaseDateDescIdDesc(invoice.getId(), getCurrentWorkspaceId());
        List<CreditCardInvoicePayment> payments = creditCardInvoicePaymentRepository
                .findAllByInvoiceIdAndWorkspaceIdOrderByPaymentDateDescIdDesc(invoice.getId(), getCurrentWorkspaceId());

        List<CreditCardInvoiceDetailsExpenseItemResponse> expenseItems = expenses.stream()
                .map(e -> new CreditCardInvoiceDetailsExpenseItemResponse(
                        e.getId(),
                        e.getDescription(),
                        e.getPurchaseDate(),
                        e.getCategory() != null ? e.getCategory().getId() : null,
                        e.getCategory() != null ? e.getCategory().getName() : null,
                        e.getSubcategory() != null ? e.getSubcategory().getId() : null,
                        e.getSubcategory() != null ? e.getSubcategory().getName() : null,
                        e.getAmount(),
                        e.getInstallmentNumber(),
                        e.getInstallmentCount(),
                        e.getInstallmentGroupId(),
                        e.getStatus(),
                        e.getStatus() != null ? e.getStatus().getLabelPtBr() : null
                ))
                .toList();

        List<CreditCardInvoiceDetailsPaymentItemResponse> paymentItems = payments.stream()
                .map(p -> new CreditCardInvoiceDetailsPaymentItemResponse(
                        p.getId(),
                        p.getAccount() != null ? p.getAccount().getId() : null,
                        p.getAccount() != null ? p.getAccount().getName() : null,
                        p.getPaymentDate(),
                        p.getAmount(),
                        p.getNotes(),
                        p.getMovement() != null ? p.getMovement().getId() : null
                ))
                .toList();

        boolean canEdit = invoice.getStatus() == CreditCardInvoiceStatus.OPEN;
        boolean canPay = nvl(invoice.getRemainingAmount()).compareTo(BigDecimal.ZERO) > 0;
        boolean canClose = invoice.getStatus() == CreditCardInvoiceStatus.OPEN
                && invoice.getClosingDate() != null
                && !LocalDate.now().isBefore(invoice.getClosingDate());

        return new CreditCardInvoiceDetailsResponse(
                invoice.getId(),
                invoice.getCreditCard().getId(),
                invoice.getCreditCard().getName(),
                toCardDisplayName(invoice),
                invoice.getCreditCard().getBrand(),
                invoice.getCreditCard().getClosingDay(),
                invoice.getCreditCard().getDueDay(),
                invoice.getReferenceYear(),
                invoice.getReferenceMonth(),
                toReferenceLabel(invoice),
                invoice.getPeriodStart(),
                invoice.getPeriodEnd(),
                invoice.getClosingDate(),
                invoice.getDueDate(),
                invoice.getPurchasesAmount(),
                invoice.getPreviousBalance(),
                invoice.getRevolvingInterest(),
                invoice.getLateFee(),
                invoice.getOtherCharges(),
                invoice.getTotalAmount(),
                invoice.getPaidAmount(),
                invoice.getRemainingAmount(),
                invoice.getRemainingAmount(),
                invoice.getStatus(),
                invoice.getStatus() != null ? invoice.getStatus().getLabelPtBr() : null,
                canClose,
                canPay,
                canEdit,
                canEdit,
                expenseItems,
                paymentItems
        );
    }

    @Transactional
    public CreditCardInvoice findOrCreateForPurchaseDate(CreditCard creditCard, LocalDate purchaseDate) {
        CreditCardInvoiceCalculationService.InvoiceCalculationResult calc = calculationService.calculate(creditCard, purchaseDate);

        return creditCardInvoiceRepository
                .findByCreditCardIdAndReferenceYearAndReferenceMonthAndCreditCardWorkspaceId(
                        creditCard.getId(),
                        calc.referenceYear(),
                        calc.referenceMonth(),
                        getCurrentWorkspaceId()
                )
                .orElseGet(() -> createInvoice(creditCard, calc));
    }

    @Transactional
    public CreditCardInvoice recalculateInvoiceTotals(Long invoiceId) {
        CreditCardInvoice invoice = findByIdOrThrow(invoiceId);
        BigDecimal billedAmount = creditCardInvoiceRepository.sumOpenExpensesByInvoiceId(invoiceId);
        BigDecimal purchasesAmount = creditCardExpenseRepository
                .sumPurchasesStartedInInvoice(invoiceId, getCurrentWorkspaceId());
        BigDecimal paidAmount = creditCardInvoicePaymentRepository.sumActivePaymentsByInvoiceId(invoiceId);
        BigDecimal totalAmount = billedAmount
                .add(nvl(invoice.getPreviousBalance()))
                .add(nvl(invoice.getRevolvingInterest()))
                .add(nvl(invoice.getLateFee()))
                .add(nvl(invoice.getOtherCharges()));
        BigDecimal remaining = totalAmount.subtract(paidAmount);
        if (remaining.signum() < 0) {
            remaining = BigDecimal.ZERO;
        }

        invoice.setPurchasesAmount(nvl(purchasesAmount));
        invoice.setPaidAmount(paidAmount);
        invoice.setTotalAmount(totalAmount);
        invoice.setRemainingAmount(remaining);
        invoice.setStatus(resolveStatus(invoice, paidAmount, remaining));
        return creditCardInvoiceRepository.save(invoice);
    }

    public void assertInvoiceAllowsExpenseChanges(CreditCardInvoice invoice) {
        if (invoice.getStatus() == CreditCardInvoiceStatus.OPEN) {
            return;
        }

        // Permite ajustes/lancamentos em faturas pagas/parciais antes do fechamento,
        // cobrindo o caso de pagamento antecipado com nova compra no mesmo ciclo.
        if (
                invoice.getClosingDate() != null &&
                LocalDate.now().isBefore(invoice.getClosingDate()) &&
                (invoice.getStatus() == CreditCardInvoiceStatus.PAID
                        || invoice.getStatus() == CreditCardInvoiceStatus.PARTIALLY_PAID)
        ) {
            return;
        }

        throw new BusinessException(
                "Fatura fechada para lancamentos. Novos lancamentos so sao permitidos ate o dia de fechamento."
        );
    }

    public BigDecimal calculateOutstandingAmount(Long creditCardId) {
        return nvl(creditCardInvoiceRepository.sumOutstandingByCreditCardId(creditCardId, getCurrentWorkspaceId()));
    }

    private CreditCardInvoice createInvoice(
            CreditCard creditCard,
            CreditCardInvoiceCalculationService.InvoiceCalculationResult calc
    ) {
        CreditCardInvoice invoice = new CreditCardInvoice();
        invoice.setCreditCard(creditCard);
        invoice.setReferenceYear(calc.referenceYear());
        invoice.setReferenceMonth(calc.referenceMonth());
        invoice.setPeriodStart(calc.periodStart());
        invoice.setPeriodEnd(calc.periodEnd());
        invoice.setClosingDate(calc.closingDate());
        invoice.setDueDate(calc.dueDate());

        BigDecimal previousBalance = resolvePreviousBalanceCarryOver(creditCard, calc.referenceYear(), calc.referenceMonth());
        invoice.setPurchasesAmount(BigDecimal.ZERO);
        invoice.setPreviousBalance(previousBalance);
        invoice.setRevolvingInterest(BigDecimal.ZERO);
        invoice.setLateFee(BigDecimal.ZERO);
        invoice.setOtherCharges(BigDecimal.ZERO);
        invoice.setPaidAmount(BigDecimal.ZERO);
        invoice.setTotalAmount(previousBalance);
        invoice.setRemainingAmount(previousBalance);
        invoice.setStatus(CreditCardInvoiceStatus.OPEN);
        return creditCardInvoiceRepository.save(invoice);
    }

    private BigDecimal resolvePreviousBalanceCarryOver(CreditCard creditCard, Integer referenceYear, Integer referenceMonth) {
        LocalDate currentRef = LocalDate.of(referenceYear, referenceMonth, 1);
        LocalDate prevRef = currentRef.minusMonths(1);
        return creditCardInvoiceRepository.findByCreditCardIdAndReferenceYearAndReferenceMonthAndCreditCardWorkspaceId(
                        creditCard.getId(),
                        prevRef.getYear(),
                        prevRef.getMonthValue(),
                        getCurrentWorkspaceId()
                )
                .map(previous -> {
                    boolean shouldCarryOver =
                            previous.getStatus() == CreditCardInvoiceStatus.PARTIALLY_PAID
                                    && nvl(previous.getPaidAmount()).compareTo(BigDecimal.ZERO) > 0
                                    && nvl(previous.getRemainingAmount()).compareTo(BigDecimal.ZERO) > 0;
                    return shouldCarryOver ? nvl(previous.getRemainingAmount()) : BigDecimal.ZERO;
                })
                .orElse(BigDecimal.ZERO);
    }

    private CreditCardInvoiceStatus resolveStatus(CreditCardInvoice invoice, BigDecimal paidAmount, BigDecimal remaining) {
        if (remaining.compareTo(BigDecimal.ZERO) == 0) {
            return CreditCardInvoiceStatus.PAID;
        }
        if (paidAmount.compareTo(BigDecimal.ZERO) > 0) {
            return CreditCardInvoiceStatus.PARTIALLY_PAID;
        }
        if (invoice.getDueDate() != null && invoice.getDueDate().isBefore(LocalDate.now())) {
            return CreditCardInvoiceStatus.OVERDUE;
        }
        return CreditCardInvoiceStatus.OPEN;
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate, String startField, String endField) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new BusinessException(startField + " deve ser menor ou igual a " + endField + ".");
        }
    }

    private BigDecimal nvl(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String toReferenceLabel(CreditCardInvoice invoice) {
        if (invoice == null || invoice.getReferenceYear() == null || invoice.getReferenceMonth() == null) {
            return null;
        }
        return String.format("%02d/%04d", invoice.getReferenceMonth(), invoice.getReferenceYear());
    }

    private String toCardDisplayName(CreditCardInvoice invoice) {
        if (invoice == null || invoice.getCreditCard() == null) {
            return null;
        }
        if (invoice.getCreditCard().getBrand() == null) {
            return invoice.getCreditCard().getName();
        }
        return invoice.getCreditCard().getName() + " - " + invoice.getCreditCard().getBrand().name();
    }
}
