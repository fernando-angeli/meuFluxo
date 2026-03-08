package com.meufluxo.model;

import com.meufluxo.enums.BrandCard;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.apache.catalina.User;

import java.math.BigDecimal;
import java.util.ArrayList;
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

    @Column(name = "last_four_digits", length = 4)
    private String lastFourDigits;

    @Column(name = "credit_limit", nullable = false, precision = 15, scale = 2)
    private BigDecimal creditLimit;

    @Column(name = "closing_day", nullable = false)
    private Integer closingDay;

    @Column(name = "due_day", nullable = false)
    private Integer dueDay;

    @Column(name = "annual_fee_enabled", nullable = false)
    private Boolean annualFeeEnabled = false;

    @Column(name = "annual_fee_amount", precision = 15, scale = 2)
    private BigDecimal annualFeeAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BrandCard brandCard;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal limitAmount;

    @Column(name = "annual_fee_waiver_threshold", precision = 15, scale = 2)
    private BigDecimal annualFeeWaiverThreshold;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_payment_account_id")
    private Account defaultPaymentAccount;

    @OneToMany(mappedBy = "creditCard")
    private List<CreditCardInvoice> invoices = new ArrayList<>();

    @OneToMany(mappedBy = "creditCard")
    private List<CreditCardTransaction> transactions = new ArrayList<>();

}
