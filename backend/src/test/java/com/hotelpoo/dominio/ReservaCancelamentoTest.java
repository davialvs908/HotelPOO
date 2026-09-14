package com.hotelpoo.dominio;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.hotelpoo.dominio.cliente.Cliente;
import com.hotelpoo.dominio.quarto.QuartoLuxo;
import com.hotelpoo.dominio.quarto.QuartoSimples;
import com.hotelpoo.dominio.reserva.Reserva;
import com.hotelpoo.dominio.reserva.StatusReserva;
import com.hotelpoo.excecao.ConflitoNegocioException;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class ReservaCancelamentoTest {

    @Test
    void cancelarMudaStatusENaoTrocaQuarto() {
        Cliente cliente = new Cliente("Joao Pereira", "12345678901", "11988887772", "joao@email.com");
        QuartoSimples quartoOriginal = new QuartoSimples("101", new BigDecimal("100.00"));
        Reserva reserva = Reserva.criar(
                cliente,
                quartoOriginal,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 3));

        reserva.cancelar();

        assertEquals(StatusReserva.CANCELADA, reserva.getStatus());
        assertSame(quartoOriginal, reserva.getQuarto());
        assertEquals(0, new BigDecimal("200.00").compareTo(reserva.getValorTotal()));
    }

    @Test
    void transferirTrocaQuartoERecalculaValorSemCancelar() {
        Cliente cliente = new Cliente("Joao Pereira", "12345678901", "11988887772", "joao@email.com");
        QuartoSimples quartoSimples = new QuartoSimples("101", new BigDecimal("100.00"));
        QuartoLuxo quartoLuxo = new QuartoLuxo("201", new BigDecimal("150.00"));
        Reserva reserva = Reserva.criar(
                cliente,
                quartoSimples,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 3));

        reserva.transferirPara(quartoLuxo);

        assertEquals(StatusReserva.RESERVADA, reserva.getStatus());
        assertSame(quartoLuxo, reserva.getQuarto());
        assertNotEquals("101", reserva.getQuarto().getNumero());
        assertEquals(0, new BigDecimal("450.00").compareTo(reserva.getValorTotal()));
    }

    @Test
    void cancelarNaoETransferencia() {
        Cliente cliente = new Cliente("Joao Pereira", "12345678901", "11988887772", "joao@email.com");
        QuartoSimples quartoOriginal = new QuartoSimples("102", new BigDecimal("100.00"));
        QuartoLuxo quartoLuxo = new QuartoLuxo("202", new BigDecimal("150.00"));
        Reserva reserva = Reserva.criar(
                cliente,
                quartoOriginal,
                LocalDate.of(2026, 11, 1),
                LocalDate.of(2026, 11, 4));

        reserva.cancelar();

        assertThrows(ConflitoNegocioException.class, () -> reserva.transferirPara(quartoLuxo));
        assertSame(quartoOriginal, reserva.getQuarto());
        assertEquals(StatusReserva.CANCELADA, reserva.getStatus());
    }
}
