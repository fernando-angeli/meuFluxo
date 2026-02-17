package com.meufluxo.model;

import com.meufluxo.enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "invoices")
public class Invoice extends BaseModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private CreditCard creditCard;

    @Column(nullable = false)
    private Integer referenceMonth;

    @Column(nullable = false)
    private Integer referenceYear;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status = InvoiceStatus.OPEN;

    private LocalDate dueDate;
    private LocalDate paidAt;
}
