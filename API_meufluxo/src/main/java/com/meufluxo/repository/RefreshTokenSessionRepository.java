package com.meufluxo.repository;

import com.meufluxo.model.RefreshTokenSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenSessionRepository extends JpaRepository<RefreshTokenSession, Long> {

    Optional<RefreshTokenSession> findByTokenHash(String tokenHash);
}
