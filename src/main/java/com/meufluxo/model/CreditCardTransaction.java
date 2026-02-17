package com.meufluxo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "credit_card_transactions")
public class CreditCardTransaction extends BaseModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private CreditCard creditCard;

    @ManyToOne(optional = false)
    private Category categoryId;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private Integer installments;

    @Column(nullable = false)
    private Integer currentInstallment;

    @Column(nullable = false)
    private LocalDateTime transactionDate;

    private String notes;

}
