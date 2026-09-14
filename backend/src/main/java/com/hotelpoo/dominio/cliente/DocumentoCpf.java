package com.hotelpoo.dominio.cliente;

import com.hotelpoo.excecao.RequisicaoInvalidaException;

public final class DocumentoCpf {

    private DocumentoCpf() {
    }

    public static String normalizar(String documentoInformado) {
        if (documentoInformado == null || documentoInformado.isBlank()) {
            throw new RequisicaoInvalidaException("CPF e obrigatorio.", "documento");
        }
        String apenasDigitos = documentoInformado.replaceAll("\\D", "");
        if (apenasDigitos.length() != 11) {
            throw new RequisicaoInvalidaException("CPF deve conter 11 digitos.", "documento");
        }
        return apenasDigitos;
    }
}
