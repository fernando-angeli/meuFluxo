package com.meufluxo.model;

import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.enums.MovementType;
import com.meufluxo.enums.PaymentMethod;
import com.meufluxo.model.workspaceAndUsers.WorkspaceUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "cash_movements")
public class CashMovement extends UserOwnedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private WorkspaceUser createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovementType movementType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subcategory_id", nullable = false)
    private SubCategory subCategory;

    @Column(name = "occurred_at", nullable = false)
    private LocalDate occurredAt;

    @Column(name = "reference_month", nullable = false, length = 7)
    private LocalDate referenceMonth;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_card_invoice_id")
    private CreditCardInvoice creditCardInvoice;

    private String description;
    private String notes;

    @PrePersist
    protected void onCreateCashMovement() {
        if (this.occurredAt == null) {
            this.occurredAt = LocalDate.now();
        }
        this.referenceMonth = this.occurredAt.withDayOfMonth(1);
    }

    @PreUpdate
    protected void onUpdateCashMovement() {
        if (this.occurredAt == null) {
            throw new BusinessException("A data do movimento não pode ser nula.");
        }
        this.referenceMonth = this.occurredAt.withDayOfMonth(1);
    }

}
