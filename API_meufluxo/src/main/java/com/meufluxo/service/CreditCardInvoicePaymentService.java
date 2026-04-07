package com.meufluxo.service;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.common.exception.NotFoundException;
import com.meufluxo.dto.creditCardInvoicePayment.CreditCardInvoicePaymentRequest;
import com.meufluxo.dto.creditCardInvoicePayment.CreditCardInvoicePaymentResponse;
import com.meufluxo.mapper.CreditCardInvoicePaymentMapper;
import com.meufluxo.model.Account;
import com.meufluxo.model.CreditCardInvoice;
import com.meufluxo.model.CreditCardInvoicePayment;
import com.meufluxo.repository.CreditCardInvoicePaymentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CreditCardInvoicePaymentService extends BaseUserService {

    private final CreditCardInvoicePaymentRepository creditCardInvoicePaymentRepository;
    private final CreditCardInvoicePaymentMapper creditCardInvoicePaymentMapper;
    private final CreditCardInvoiceService creditCardInvoiceService;
    private final AccountService accountService;
    private final WorkspaceSyncStateService workspaceSyncStateService;

    public CreditCardInvoicePaymentService(
            CurrentUserService currentUserService,
            CreditCardInvoicePaymentRepository creditCardInvoicePaymentRepository,
            CreditCardInvoicePaymentMapper creditCardInvoicePaymentMapper,
            CreditCardInvoiceService creditCardInvoiceService,
            AccountService accountService,
            WorkspaceSyncStateService workspaceSyncStateService
    ) {
        super(currentUserService);
        this.creditCardInvoicePaymentRepository = creditCardInvoicePaymentRepository;
        this.creditCardInvoicePaymentMapper = creditCardInvoicePaymentMapper;
        this.creditCardInvoiceService = creditCardInvoiceService;
        this.accountService = accountService;
        this.workspaceSyncStateService = workspaceSyncStateService;
    }

    public CreditCardInvoicePaymentResponse findById(Long id) {
        return creditCardInvoicePaymentMapper.toResponse(findByIdOrThrow(id));
    }

    public PageResponse<CreditCardInvoicePaymentResponse> findByFilters(
            Long invoiceId,
            Long accountId,
            LocalDate paymentDateStart,
            LocalDate paymentDateEnd,
            Pageable pageable
    ) {
        Optional.ofNullable(invoiceId).ifPresent(creditCardInvoiceService::findByIdOrThrow);
        Optional.ofNullable(accountId).ifPresent(accountService::findByIdOrThrow);
        validateDateRange(paymentDateStart, paymentDateEnd);

        Specification<CreditCardInvoicePayment> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("workspace").get("id"), getCurrentWorkspaceId()));

            if (invoiceId != null) {
                predicates.add(cb.equal(root.get("invoice").get("id"), invoiceId));
            }
            if (accountId != null) {
                predicates.add(cb.equal(root.get("account").get("id"), accountId));
            }
            if (paymentDateStart != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("paymentDate"), paymentDateStart));
            }
            if (paymentDateEnd != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("paymentDate"), paymentDateEnd));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<CreditCardInvoicePayment> page = creditCardInvoicePaymentRepository.findAll(spec, pageable);
        return PageResponse.toPageResponse(page.map(creditCardInvoicePaymentMapper::toResponse));
    }

    @Transactional
    public CreditCardInvoicePaymentResponse create(CreditCardInvoicePaymentRequest request) {
        CreditCardInvoice invoice = creditCardInvoiceService.findByIdOrThrow(request.invoiceId());
        Account account = accountService.findByIdOrThrow(request.accountId());

        if (invoice.getStatus() == com.meufluxo.enums.CreditCardInvoiceStatus.PAID) {
            throw new BusinessException("Não é possível registrar pagamento em uma fatura já paga.");
        }
        if (invoice.getRemainingAmount() != null && request.amount().compareTo(invoice.getRemainingAmount()) > 0) {
            throw new BusinessException("O pagamento não pode ser maior que o saldo restante da fatura.");
        }

        CreditCardInvoicePayment payment = new CreditCardInvoicePayment();
        payment.setWorkspace(getCurrentWorkspace());
        payment.setInvoice(invoice);
        payment.setAccount(account);
        payment.setPaymentDate(request.paymentDate());
        payment.setAmount(request.amount().setScale(2, java.math.RoundingMode.HALF_UP));
        payment.setNotes(trimToNull(request.notes()));

        CreditCardInvoicePayment saved = creditCardInvoicePaymentRepository.save(payment);
        creditCardInvoiceService.recalculateInvoiceTotals(invoice.getId());
        workspaceSyncStateService.incrementCreditCardsVersion(getCurrentWorkspaceId());
        return creditCardInvoicePaymentMapper.toResponse(saved);
    }

    public CreditCardInvoicePayment findByIdOrThrow(Long id) {
        return creditCardInvoicePaymentRepository.findByIdAndWorkspaceId(id, getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("Pagamento de fatura não encontrado com ID: " + id));
    }

    private void validateDateRange(LocalDate paymentDateStart, LocalDate paymentDateEnd) {
        if (paymentDateStart != null && paymentDateEnd != null && paymentDateStart.isAfter(paymentDateEnd)) {
            throw new BusinessException("paymentDateStart deve ser menor ou igual a paymentDateEnd.");
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
