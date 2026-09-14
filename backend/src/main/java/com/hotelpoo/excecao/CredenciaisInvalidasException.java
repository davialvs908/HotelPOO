package com.hotelpoo.excecao;

public class CredenciaisInvalidasException extends RuntimeException {

    public CredenciaisInvalidasException() {
        super("Login ou senha invalidos.");
    }
}
