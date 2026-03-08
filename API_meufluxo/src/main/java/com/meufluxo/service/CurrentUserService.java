package com.meufluxo.service;

import com.meufluxo.model.User;
import com.meufluxo.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserRepository repository;

    public CurrentUserService(UserRepository repository) {
        this.repository = repository;
    }

    public Long getCurrentUserId(){
        return 1L;
    }

    public User getCurrentUser(){
        return repository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Usuário mock não encontrado."));
    }
}
