package com.meufluxo.model;

import com.meufluxo.enums.HolidayScope;
import com.meufluxo.model.workspaceAndUsers.Workspace;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(
        name = "holidays",
        indexes = {
                @Index(name = "idx_holidays_holiday_date", columnList = "holiday_date"),
                @Index(name = "idx_holidays_scope", columnList = "scope"),
                @Index(name = "idx_holidays_workspace_id", columnList = "workspace_id")
        }
)
public class Holiday extends BaseModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "holiday_date", nullable = false)
    private LocalDate holidayDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HolidayScope scope;

    @Column(name = "country_code", length = 5)
    private String countryCode;

    @Column(name = "state_code", length = 10)
    private String stateCode;

    @Column(name = "city_name", length = 120)
    private String cityName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;
}
