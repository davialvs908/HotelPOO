package com.hotelpoo.dominio.quarto;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.math.BigDecimal;

@Entity
@DiscriminatorValue("LUXO")
public class QuartoLuxo extends Quarto {

    private static final BigDecimal MULTIPLICADOR_LUXO = new BigDecimal("1.5");

    protected QuartoLuxo() {
    }

    public QuartoLuxo(String numero, BigDecimal precoBasePorNoite) {
        super(numero, precoBasePorNoite);
    }

    @Override
    public BigDecimal calcularPreco(int noites) {
        return arredondar(
                getPrecoBasePorNoite()
                        .multiply(MULTIPLICADOR_LUXO)
                        .multiply(BigDecimal.valueOf(noites)));
    }

    @Override
    public TipoQuarto getTipo() {
        return TipoQuarto.LUXO;
    }
}
