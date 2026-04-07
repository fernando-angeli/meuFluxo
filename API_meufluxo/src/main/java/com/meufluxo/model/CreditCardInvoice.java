package com.meufluxo.model;

import com.meufluxo.enums.CreditCardInvoiceStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@Table(
        name = "credit_card_invoices",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_credit_card_invoice_reference",
                        columnNames = {"credit_card_id", "reference_year", "reference_month"}
                )
        }
)
public class CreditCardInvoice extends BaseModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_year", nullable = false)
    private Integer referenceYear;

    @Column(name = "reference_month", nullable = false)
    private Integer referenceMonth;

    @Column(name = "period_start")
    private LocalDate periodStart;

    @Column(name = "period_end")
    private LocalDate periodEnd;

    @Column(name = "closing_date", nullable = false)
    private LocalDate closingDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "purchases_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal purchasesAmount = BigDecimal.ZERO;

    @Column(name = "previous_balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal previousBalance = BigDecimal.ZERO;

    @Column(name = "revolving_interest", nullable = false, precision = 15, scale = 2)
    private BigDecimal revolvingInterest = BigDecimal.ZERO;

    @Column(name = "late_fee", nullable = false, precision = 15, scale = 2)
    private BigDecimal lateFee = BigDecimal.ZERO;

    @Column(name = "other_charges", nullable = false, precision = 15, scale = 2)
    private BigDecimal otherCharges = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "paid_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "remaining_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal remainingAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CreditCardInvoiceStatus status = CreditCardInvoiceStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "credit_card_id", nullable = false)
    private CreditCard creditCard;

    @OneToMany(mappedBy = "invoice")
    private List<CreditCardExpense> expenses;

    @OneToMany(mappedBy = "invoice")
    private List<CreditCardInvoicePayment> payments;

}
