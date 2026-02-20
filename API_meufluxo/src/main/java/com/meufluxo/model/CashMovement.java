package com.meufluxo.model;

import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.enums.MovementType;
import com.meufluxo.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "cash_movements")
public class CashMovement extends BaseModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovementType movementType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @ManyToOne(optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(optional = false)
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(name = "occurred_at", nullable = false)
    private LocalDate occurredAt;

    @Column(name = "reference_month", nullable = false)
    private LocalDate referenceMonth;

    private String description;
    private String notes;

    public void applyImpact() {
        if (this.movementType == MovementType.EXPENSE) {
            account.debit(amount.abs());
        } else {
            account.credit(amount);
        }
    }

    public void revertImpact() {
        if (this.movementType == MovementType.EXPENSE) {
            account.credit(amount);
        } else {
            account.debit(amount.abs());
        }
    }

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
