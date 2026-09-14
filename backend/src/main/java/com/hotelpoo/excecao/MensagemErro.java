package com.hotelpoo.excecao;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record MensagemErro(String mensagem, String campo) {

    public MensagemErro(String mensagem) {
        this(mensagem, null);
    }
}
