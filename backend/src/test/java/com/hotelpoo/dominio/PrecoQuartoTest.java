package com.hotelpoo.dominio;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.hotelpoo.dominio.quarto.QuartoLuxo;
import com.hotelpoo.dominio.quarto.QuartoSimples;
import com.hotelpoo.dominio.quarto.Suite;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class PrecoQuartoTest {

    @Test
    void simplesCobraPrecoBasePorNoite() {
        QuartoSimples quarto = new QuartoSimples("101", new BigDecimal("100.00"));
        assertEquals(0, new BigDecimal("100.00").compareTo(quarto.calcularPreco(1)));
        assertEquals(0, new BigDecimal("300.00").compareTo(quarto.calcularPreco(3)));
    }

    @Test
    void luxoAplicaMultiplicadorDeUmEMeio() {
        QuartoLuxo quarto = new QuartoLuxo("201", new BigDecimal("150.00"));
        assertEquals(0, new BigDecimal("225.00").compareTo(quarto.calcularPreco(1)));
        assertEquals(0, new BigDecimal("450.00").compareTo(quarto.calcularPreco(2)));
    }

    @Test
    void suiteAplicaDobroMaisTaxaDeServicoDiaria() {
        Suite quarto = new Suite("301", new BigDecimal("200.00"));
        assertEquals(0, new BigDecimal("450.00").compareTo(quarto.calcularPreco(1)));
        assertEquals(0, new BigDecimal("900.00").compareTo(quarto.calcularPreco(2)));
    }
}
