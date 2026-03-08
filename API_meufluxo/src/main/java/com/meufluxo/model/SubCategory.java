package com.meufluxo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(
        name = "sub_categories",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_subcategory_user_category_name", columnNames = {"user_id", "category_id", "name"})
        }
)
public class SubCategory extends UserOwnedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

}
