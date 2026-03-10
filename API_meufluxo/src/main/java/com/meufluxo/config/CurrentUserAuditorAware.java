package com.meufluxo.config;

import com.meufluxo.service.CurrentUserService;
import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("auditorProvider")
public class CurrentUserAuditorAware implements AuditorAware<Long> {

    private final CurrentUserService currentUserService;

    public CurrentUserAuditorAware(CurrentUserService currentUserService) {
        this.currentUserService = currentUserService;
    }

    @Override
    public Optional<Long> getCurrentAuditor() {
        return Optional.ofNullable(currentUserService.getCurrentUserId());
    }
}
