package com.hotelpoo.excecao;

public class RequisicaoInvalidaException extends RuntimeException {

    private final String campo;

    public RequisicaoInvalidaException(String mensagem) {
        this(mensagem, null);
    }

    public RequisicaoInvalidaException(String mensagem, String campo) {
        super(mensagem);
        this.campo = campo;
    }

    public String getCampo() {
        return campo;
    }
}
