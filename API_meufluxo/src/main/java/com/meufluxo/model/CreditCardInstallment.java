package com.meufluxo.model;

import com.meufluxo.enums.CreditCardInstallmentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(
        name = "credit_card_installments",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_transaction_installment_number", columnNames = {"transaction_id", "installment_number"})
        }
)
public class CreditCardInstallment extends BaseModel{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "installment_number", nullable = false)
    private Integer installmentNumber;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "competence_date", nullable = false)
    private LocalDate competenceDate;

    @Column(name = "reference_month", nullable = false, length = 7)
    private String referenceMonth; // yyyy-MM

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CreditCardInstallmentStatus status = CreditCardInstallmentStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transaction_id", nullable = false)
    private CreditCardTransaction transaction;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invoice_id", nullable = false)
    private CreditCardInvoice invoice;
}
