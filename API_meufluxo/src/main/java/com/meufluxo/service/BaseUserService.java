package com.meufluxo.service;

import com.meufluxo.model.User;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public abstract class BaseUserService {

    protected final CurrentUserService currentUserService;

    protected User getCurrentUser(){
        return currentUserService.getCurrentUser();
    }

    protected Long getCurrentUserId(){
        return currentUserService.getCurrentUserId();
    }
}
