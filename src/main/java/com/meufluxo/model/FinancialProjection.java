package com.meufluxo.model;

import com.meufluxo.enums.ProjectionStatus;
import com.meufluxo.enums.RecurrenceType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "financial_projections")
public class FinancialProjection extends BaseModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    private String description;

    @ManyToOne(optional = false)
    private Category categoryId;

    @ManyToOne(optional = false)
    private Account accountId;

    @Column(nullable = false)
    private LocalDateTime dueDate;

    private boolean recurring;

    @Enumerated(EnumType.STRING)
    private RecurrenceType recurrenceType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectionStatus projectionStatus;
    
    private String notes;

}
