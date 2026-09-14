package com.hotelpoo.dominio.quarto;

import com.hotelpoo.excecao.RequisicaoInvalidaException;
import java.math.BigDecimal;

public final class FabricaQuarto {

    private FabricaQuarto() {
    }

    public static Quarto criar(TipoQuarto tipo, String numero, BigDecimal precoBasePorNoite) {
        if (tipo == null) {
            throw new RequisicaoInvalidaException("Tipo do quarto e obrigatorio.", "tipo");
        }
        return switch (tipo) {
            case SIMPLES -> new QuartoSimples(numero, precoBasePorNoite);
            case LUXO -> new QuartoLuxo(numero, precoBasePorNoite);
            case SUITE -> new Suite(numero, precoBasePorNoite);
        };
    }
}
