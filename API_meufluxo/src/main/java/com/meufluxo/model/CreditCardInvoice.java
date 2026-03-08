package com.meufluxo.model;

import com.meufluxo.enums.CreditCardInvoiceStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(
        name = "credit_card_invoices",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_credit_card_invoice_reference", columnNames = {"credit_card_id", "reference_month"})
        }
)
public class CreditCardInvoice extends BaseModel{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_month", nullable = false, length = 7)
    private String referenceMonth; // yyyy-MM

    @Column(name = "closing_date", nullable = false)
    private LocalDate closingDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "adjusted_due_date")
    private LocalDate adjustedDueDate;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "paid_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CreditCardInvoiceStatus status = CreditCardInvoiceStatus.OPEN;

    @Column(name = "paid_at")
    private LocalDate paidAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "credit_card_id", nullable = false)
    private CreditCard creditCard;

    @OneToMany(mappedBy = "invoice")
    private List<CreditCardInstallment> installments = new ArrayList<>();

}
