package com.meufluxo.repository;

import com.meufluxo.model.workspaceAndUsers.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
