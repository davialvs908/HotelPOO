package com.hotelpoo.dominio.quarto;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.math.BigDecimal;

@Entity
@DiscriminatorValue("SUITE")
public class Suite extends Quarto {

    private static final BigDecimal MULTIPLICADOR_SUITE = new BigDecimal("2.0");
    private static final BigDecimal TAXA_SERVICO_DIARIA = new BigDecimal("50.00");

    protected Suite() {
    }

    public Suite(String numero, BigDecimal precoBasePorNoite) {
        super(numero, precoBasePorNoite);
    }

    @Override
    public BigDecimal calcularPreco(int noites) {
        BigDecimal noitesDecimal = BigDecimal.valueOf(noites);
        BigDecimal diariaComMultiplicador = getPrecoBasePorNoite().multiply(MULTIPLICADOR_SUITE).multiply(noitesDecimal);
        BigDecimal servicoPeriodo = TAXA_SERVICO_DIARIA.multiply(noitesDecimal);
        return arredondar(diariaComMultiplicador.add(servicoPeriodo));
    }

    @Override
    public TipoQuarto getTipo() {
        return TipoQuarto.SUITE;
    }
}
