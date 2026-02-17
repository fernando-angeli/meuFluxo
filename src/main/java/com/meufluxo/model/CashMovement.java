package com.meufluxo.model;

import com.meufluxo.enums.MovementType;
import com.meufluxo.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "cash_movements")
public class CashMovement {

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
    private Category category;

    @ManyToOne(optional = false)
    private Account account;

    private LocalDateTime occurredAt;
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

}
