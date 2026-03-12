package com.meufluxo.config;

import com.meufluxo.enums.UserLanguage;
import com.meufluxo.enums.UserTheme;
import com.meufluxo.enums.WorkspaceRole;
import com.meufluxo.model.workspaceAndUsers.User;
import com.meufluxo.model.workspaceAndUsers.UserPreference;
import com.meufluxo.model.workspaceAndUsers.Workspace;
import com.meufluxo.model.workspaceAndUsers.WorkspaceUser;
import com.meufluxo.repository.UserPreferenceRepository;
import com.meufluxo.repository.UserRepository;
import com.meufluxo.repository.WorkspaceRepository;
import com.meufluxo.repository.WorkspaceUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("dev")
public class DevDataInitializer {

    @Bean
    CommandLineRunner seedDevelopmentUser(
            UserRepository userRepository,
            UserPreferenceRepository userPreferenceRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceUserRepository workspaceUserRepository,
            JdbcTemplate jdbcTemplate,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            syncSequence(jdbcTemplate, "users", "id");
            syncSequence(jdbcTemplate, "workspaces", "id");
            syncSequence(jdbcTemplate, "workspace_users", "id");
            syncSequence(jdbcTemplate, "user_preferences", "id");

            User user = userRepository.findByEmailIgnoreCase("admin@meufluxo.com")
                    .orElseGet(User::new);

            user.setName("Fernando");
            user.setEmail("admin@meufluxo.com");
            user.setPassword(passwordEncoder.encode("123456"));
            user.setEnabled(true);
            user.setActive(true);

            User savedUser = userRepository.save(user);

            Workspace personalWorkspace = upsertWorkspace(
                    workspaceRepository,
                    "Pessoal",
                    "Workspace pessoal do Fernando"
            );
            Workspace companyWorkspace = upsertWorkspace(
                    workspaceRepository,
                    "Empresa",
                    "Workspace compartilhado da empresa"
            );

            upsertMembership(workspaceUserRepository, savedUser, personalWorkspace, WorkspaceRole.OWNER);
            upsertMembership(workspaceUserRepository, savedUser, companyWorkspace, WorkspaceRole.ADMIN);

            UserPreference preference = userPreferenceRepository.findByUserIdWithActiveWorkspace(savedUser.getId())
                    .orElseGet(UserPreference::new);

            preference.setUser(savedUser);
            preference.setLanguage(UserLanguage.PT_BR);
            preference.setTheme(UserTheme.DARK);
            preference.setCurrency("BRL");
            preference.setDateFormat("dd/MM/yyyy");
            preference.setTimezone("America/Sao_Paulo");
            preference.setActiveWorkspace(personalWorkspace);
            preference.setActive(true);

            userPreferenceRepository.save(preference);
        };
    }

    private void syncSequence(JdbcTemplate jdbcTemplate, String tableName, String columnName) {
        Boolean tableExists = jdbcTemplate.queryForObject(
                "select exists (select 1 from information_schema.tables where table_name = ?)",
                Boolean.class,
                tableName
        );

        if (!Boolean.TRUE.equals(tableExists)) {
            return;
        }

        String sql = """
                select setval(
                    pg_get_serial_sequence(?, ?),
                    coalesce((select max(%s) from %s), 1),
                    true
                )
                """.formatted(columnName, tableName);

        jdbcTemplate.queryForObject(sql, Long.class, tableName, columnName);
    }

    private Workspace upsertWorkspace(
            WorkspaceRepository workspaceRepository,
            String name,
            String description
    ) {
        Workspace workspace = workspaceRepository.findByNameIgnoreCase(name)
                .orElseGet(Workspace::new);

        workspace.setName(name);
        workspace.setDescription(description);
        return workspaceRepository.save(workspace);
    }

    private void upsertMembership(
            WorkspaceUserRepository workspaceUserRepository,
            User user,
            Workspace workspace,
            WorkspaceRole role
    ) {
        WorkspaceUser membership = workspaceUserRepository
                .findActiveMembershipByUserIdAndWorkspaceId(user.getId(), workspace.getId())
                .orElseGet(WorkspaceUser::new);

        membership.setUser(user);
        membership.setWorkspace(workspace);
        membership.setRole(role);
        workspaceUserRepository.save(membership);
    }
}
