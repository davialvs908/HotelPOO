package com.hotelpoo.dominio.quarto;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.math.BigDecimal;

@Entity
@DiscriminatorValue("SIMPLES")
public class QuartoSimples extends Quarto {

    protected QuartoSimples() {
    }

    public QuartoSimples(String numero, BigDecimal precoBasePorNoite) {
        super(numero, precoBasePorNoite);
    }

    @Override
    public BigDecimal calcularPreco(int noites) {
        return arredondar(getPrecoBasePorNoite().multiply(BigDecimal.valueOf(noites)));
    }

    @Override
    public TipoQuarto getTipo() {
        return TipoQuarto.SIMPLES;
    }
}
