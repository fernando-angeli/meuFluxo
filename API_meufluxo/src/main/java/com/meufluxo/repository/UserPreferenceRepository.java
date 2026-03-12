package com.meufluxo.repository;

import com.meufluxo.model.workspaceAndUsers.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {

    @Query("""
            select preference
            from UserPreference preference
            left join fetch preference.activeWorkspace
            where preference.user.id = :userId
            """)
    Optional<UserPreference> findByUserIdWithActiveWorkspace(@Param("userId") Long userId);
}
