package com.meufluxo.model;

import com.meufluxo.enums.BrandCard;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "credit_cards")
public class CreditCard extends UserOwnedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "credit_limit", precision = 15, scale = 2)
    private BigDecimal creditLimit;

    // Campos legados mantidos para compatibilidade com bases antigas.
    @Column(name = "last_four_digits", length = 4)
    private String lastFourDigits;

    @Column(name = "annual_fee_enabled", nullable = false)
    private Boolean annualFeeEnabled = false;

    @Column(name = "annual_fee_amount", precision = 15, scale = 2)
    private BigDecimal annualFeeAmount;

    @Column(name = "limit_amount", precision = 15, scale = 2)
    private BigDecimal limitAmount;

    @Column(name = "annual_fee_waiver_threshold", precision = 15, scale = 2)
    private BigDecimal annualFeeWaiverThreshold;

    @Column(name = "closing_day", nullable = false)
    private Integer closingDay;

    @Column(name = "due_day", nullable = false)
    private Integer dueDay;

    @Enumerated(EnumType.STRING)
    @Column(name = "brand_card", nullable = false, length = 50)
    private BrandCard brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_payment_account_id")
    private Account defaultPaymentAccount;

    @Column(length = 1000)
    private String notes;

    @OneToMany(mappedBy = "creditCard")
    private List<CreditCardInvoice> invoices;

    @OneToMany(mappedBy = "creditCard")
    private List<CreditCardExpense> expenses;

}
