package com.meufluxo.repository;

import com.meufluxo.model.workspaceAndUsers.WorkspaceUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkspaceUserRepository extends JpaRepository<WorkspaceUser, Long> {

    @Query("""
            select workspaceUser
            from WorkspaceUser workspaceUser
            join fetch workspaceUser.workspace workspace
            where workspaceUser.user.id = :userId
            order by workspaceUser.id asc
            """)
    List<WorkspaceUser> findActiveMembershipsByUserId(@Param("userId") Long userId);

    @Query("""
            select workspaceUser
            from WorkspaceUser workspaceUser
            join fetch workspaceUser.workspace workspace
            where workspaceUser.user.id = :userId
              and workspaceUser.workspace.id = :workspaceId
            """)
    Optional<WorkspaceUser> findActiveMembershipByUserIdAndWorkspaceId(
            @Param("userId") Long userId,
            @Param("workspaceId") Long workspaceId
    );
}
