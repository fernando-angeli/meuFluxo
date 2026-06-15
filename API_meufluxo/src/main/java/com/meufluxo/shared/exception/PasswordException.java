package com.meufluxo.shared.exception;

public class PasswordException extends RuntimeException {
    public PasswordException() {
        super("Senha inválida");
    }
    public PasswordException(String message) {
        super(message);
    }
}
