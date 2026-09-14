package com.hotelpoo.excecao;

public class ConflitoNegocioException extends RuntimeException {

    private final String campo;

    public ConflitoNegocioException(String mensagem) {
        this(mensagem, null);
    }

    public ConflitoNegocioException(String mensagem, String campo) {
        super(mensagem);
        this.campo = campo;
    }

    public String getCampo() {
        return campo;
    }
}
