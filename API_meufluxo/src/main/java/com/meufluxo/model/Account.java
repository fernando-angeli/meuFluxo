package com.meufluxo.model;

import com.meufluxo.enums.AccountType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;

import javax.swing.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "accounts")
public class Account extends BaseModel{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType accountType;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal initialBalance;

    @Setter(AccessLevel.NONE)
    @Column(precision = 15, scale = 2)
    private BigDecimal currentBalance;

    @Setter(AccessLevel.NONE)
    private LocalDateTime balanceUpdatedAt;

    private void applyBalanceImpact(BigDecimal impact) {

        if (impact == null) {
            throw new IllegalArgumentException("Impact cannot be null");
        }

        if (this.currentBalance == null) {
            this.currentBalance = this.initialBalance != null
                    ? this.initialBalance
                    : BigDecimal.ZERO;
        }

        this.currentBalance = this.currentBalance.add(impact);
        this.balanceUpdatedAt = LocalDateTime.now();
    }

    public void credit(BigDecimal amount) {
        applyBalanceImpact(amount);
    }

    public void debit(BigDecimal amount) {
        applyBalanceImpact(amount.negate());
    }

    public void initializeBalance() {
        this.currentBalance = this.initialBalance != null
                ? this.initialBalance
                : BigDecimal.ZERO;

        this.balanceUpdatedAt = LocalDateTime.now();
    }
}
