package com.meufluxo.model.workspaceAndUsers;

import com.meufluxo.converter.UserLanguageConverter;
import com.meufluxo.converter.UserThemeConverter;
import com.meufluxo.enums.UserLanguage;
import com.meufluxo.enums.UserTheme;
import com.meufluxo.model.BaseModel;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "user_preferences")
public class UserPreference extends BaseModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Convert(converter = UserLanguageConverter.class)
    @Column(nullable = false, length = 10)
    private UserLanguage language;

    @Convert(converter = UserThemeConverter.class)
    @Column(nullable = false, length = 10)
    private UserTheme theme;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(name = "date_format", nullable = false, length = 20)
    private String dateFormat;

    @Column(nullable = false, length = 60)
    private String timezone;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "active_workspace_id")
    private Workspace activeWorkspace;
}
