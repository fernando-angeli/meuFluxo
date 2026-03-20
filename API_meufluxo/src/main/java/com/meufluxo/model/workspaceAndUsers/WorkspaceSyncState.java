package com.meufluxo.model.workspaceAndUsers;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "workspace_sync_states")
public class WorkspaceSyncState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false, unique = true)
    private Workspace workspace;

    @Column(nullable = false)
    private Long categoriesVersion = 1L;

    @Column(nullable = false)
    private Long subCategoriesVersion = 1L;

    @Column(nullable = false)
    private Long accountsVersion = 1L;

    @Column(nullable = false)
    private Long creditCardsVersion = 1L;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    void touch() {
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }
}
