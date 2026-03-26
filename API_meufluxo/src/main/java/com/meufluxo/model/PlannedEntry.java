package com.meufluxo.model;

import com.meufluxo.enums.FinancialDirection;
import com.meufluxo.enums.PlannedAmountBehavior;
import com.meufluxo.enums.PlannedEntryOriginType;
import com.meufluxo.enums.PlannedEntryStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(
        name = "planned_entries",
        indexes = {
                @Index(name = "idx_planned_entries_workspace_direction_due_date", columnList = "workspace_id,direction,due_date"),
                @Index(name = "idx_planned_entries_workspace_direction_status_due_date", columnList = "workspace_id,direction,status,due_date"),
                @Index(name = "idx_planned_entries_group_id", columnList = "group_id")
        }
)
public class PlannedEntry extends UserOwnedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FinancialDirection direction;

    @Column(nullable = false, length = 255)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subcategory_id")
    private SubCategory subCategory;

    @Column(name = "expected_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal expectedAmount;

    @Column(name = "actual_amount", precision = 15, scale = 2)
    private BigDecimal actualAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "amount_behavior", nullable = false, length = 20)
    private PlannedAmountBehavior amountBehavior;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PlannedEntryStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_account_id")
    private Account defaultAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "settled_account_id")
    private Account settledAccount;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movement_id")
    private CashMovement movement;

    @Column(name = "group_id")
    private UUID groupId;

    @Enumerated(EnumType.STRING)
    @Column(name = "origin_type", nullable = false, length = 20)
    private PlannedEntryOriginType originType;

    @Column(length = 2000)
    private String notes;
}
